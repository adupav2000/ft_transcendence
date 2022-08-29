import { Cron, Interval } from "@nestjs/schedule";
import { WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { GameInstance } from "../game.instance";
import { AuthenticatedSocket, GameState, Player } from "../game.type";
import { Lobby } from "./lobby";

export class LobbyManager
{
    @WebSocketServer()
    public server;

    private readonly lobbies: Map<string, Lobby> = new Map<string, Lobby>();
    private readonly avalaibleLobbies: Lobby[] = [];

    constructor() { }

    public initializeSocket(client: AuthenticatedSocket): void
    {
        client.data.lobby = null;
    }

    public terminateSocket(client: AuthenticatedSocket): void
    {
        client.data.lobby?.removeClient(client);
    }

    public createLobby(): Lobby
    {
        let lobby = new Lobby(this.server);

        this.lobbies.set(lobby.id, lobby);

        return lobby;
    }

    public joinQueue(client: AuthenticatedSocket, player:Player)
    {
        let lobby: Lobby;

        if (this.avalaibleLobbies.length > 0)
            lobby = this.avalaibleLobbies.shift();
        else
        {
            lobby = this.createLobby();
            this.avalaibleLobbies.push(lobby);
        }

        lobby.addClient(client, player);
    }
    public joinLobby(lobbyId: string, client: AuthenticatedSocket): void
    {
        this.lobbies[lobbyId].addClient(client);
    }

    //Deletes deletes stopped lobbies every 5 minutes
    @Interval(3 * 1000)
    private lobbiesCleaner(): void
    {
        for (let i = 0; i < this.avalaibleLobbies.length; i++) {
            if (this.avalaibleLobbies[i].nbPlayers == 0) {
                this.avalaibleLobbies.splice(i, 1);
            }
            
        }
        console.log(`Avalaible lobbies: ${this.avalaibleLobbies.length}`);
        this.lobbies.forEach((lobby, id) => {
            if (lobby.state == GameState.Stopped && lobby.nbPlayers == 0)
            {
                this.lobbies.delete(id);
            }
        });
        console.log(`Active lobbies: ${this.lobbies.size}`);
    }

}