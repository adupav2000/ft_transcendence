import { forwardRef, Inject, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Cron, Interval } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { AuthService } from "src/auth/auth.service";
import { AuthenticatedSocket } from 'src/auth/types/auth.type';
import { matchDto } from "src/match/dto/match.dto";
import { MatchService } from "src/match/match.service";
import { UsersService } from "src/users/users.service";
import { GameInstance } from "../game.instance";
import { GameMode, GameOptions, GameState, Player } from "../types/game.type";
import { Lobby } from "./lobby";

type availableLobbiesT = [{
    lobbyId: string;
    playersId: string[];
}]

export class LobbyManager
{
    @WebSocketServer()
    public server;

    private readonly lobbies: Map<string, Lobby> = new Map<string, Lobby>();
    private readonly availableLobbies: Lobby[] = [];

    constructor(
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService,
        @Inject(forwardRef(() => UsersService))
        private userService: UsersService,
        @Inject(forwardRef(() => MatchService))
        private matchService: MatchService,
    ) { }

    public initializeSocket(client: AuthenticatedSocket): void
    {
    }

    public terminateSocket(client: AuthenticatedSocket): void
    {
       
        for (let i = 0; i < this.availableLobbies.length; i++)
        {
            if (this.availableLobbies[i].isClient(client.login))
            {
                this.availableLobbies.splice(i, 1);
                client.leave(this.availableLobbies[i]?.id);
            }
        }
        client.leave(client.roomId);
    }

    public createLobby(options: GameOptions): Lobby
    {
        let lobby = new Lobby(this.server, options, this);

        this.availableLobbies.push(lobby);

        return lobby;
    }

    public async destroyLobby(lobbyId: string)
    {
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby)
            return ;
        for (const [clientLogin, roomId] of lobby.clients)
        {
            await this.authService.updateLobby(clientLogin, null);
        }
        this.lobbies.delete(lobbyId);
    }

    public async joinQueue(client: AuthenticatedSocket, mode:GameMode)
    {
        let lobby: Lobby = null;
   
        for (let i = 0; i < this.availableLobbies.length; i++)
        {
            const currLobby = this.availableLobbies[i];
            if (currLobby.isClient(client.login) === false && !currLobby.isPrivate() && currLobby.getMode() == mode) 
            {
                lobby = this.availableLobbies.splice(i, 1).at(0);
                client.lobbyId = lobby.id;
                this.lobbies.set(lobby.id, lobby)
                break ;
            }
        }
        if (lobby === null)
        {	
            const options: GameOptions = {
                mode: mode,
                inviteMode: false,
            }
            lobby = this.createLobby(options);
        }
        lobby.addClient(client);
        await this.authService.updateLobby(client.login, lobby.id);
    }

    public leaveQueue(client: AuthenticatedSocket)
    {
        for (let i = 0; i < this.availableLobbies.length; i++)
        {
            if (this.availableLobbies[i].isClient(client.login))
            {
                this.availableLobbies.splice(i, 1);
                this.destroyLobby(this.availableLobbies[i]?.id);
                client.lobby = null;
                this.authService.updateLobby(client.login, null);
            }
        }
    }

    public joinLobby(lobbyId: string, client: AuthenticatedSocket)
    {
        
        const lobby: Lobby = this.lobbies.get(lobbyId);
        if (!lobby)
           throw new NotFoundException("This lobby does not exist anymore");
        lobby.addClient(client);
        this.authService.updateLobby(client.login, lobby.id);
    }

    public joinInvitation(client: AuthenticatedSocket, senderLogin: string): boolean
    {
        let lobby: Lobby = null;
        for (let i = 0; i < this.availableLobbies.length; i++)
        {
            const currLobby = this.availableLobbies[i];
            if (currLobby.isClient(senderLogin) === true && currLobby.isPrivate()) 
            {
                lobby = this.availableLobbies.splice(i, 1).at(0);
                client.lobbyId = lobby.id;
                if (lobby.nbPlayers == 1)
                    this.lobbies.set(lobby.id, lobby);
                this.authService.updateLobby(client.login, lobby.id);
                lobby.addClient(client);
                return true;
            }
        }
        return false;
    }

    public async joinLobbies(client: AuthenticatedSocket)
    {
        if (client.lobbyId)
        {
            client.lobby = this.lobbies.get(client.lobbyId);
        }
        for (const [lobbyId, lobby] of this.lobbies)
        {
            if (lobby.isClient(client.login))
            {
                client.join(lobbyId);
            }
        }
    }

    public async storeResult(dto: matchDto)
    {
        await this.matchService.matchResult(dto);
    }

    public getLobby(lobbyId: string)
    {
        if (!lobbyId)
            return null;
        const resLobby = this.lobbies.get(lobbyId);
        return resLobby;
    }

    public getActiveLobbies()
    {
        let res:{lobbyId: string, playersId: string[]}[] = [];
        this.lobbies.forEach((lobby, id) => {
            if (lobby.state == GameState.Started && lobby.nbPlayers == 2)
            {
                res.push({
                    lobbyId: id,
                    playersId: lobby.playersId(),
                })
            }
        });
        return res;
        
    }

    public async getPlayerUsername(login: string)
    {
        return await this.userService.getUserUsername(login);
    }

}