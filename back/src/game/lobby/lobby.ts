import { v4 } from "uuid";
import { Server } from "socket.io";
import { AuthenticatedSocket, GameData, GameState, Player } from "../game.type";
import { GameInstance } from "../game.instance";
import { Socket } from "dgram";

export class Lobby
{
    public readonly id:             string = v4();
    public          nbPlayers:      number = 0;
    public readonly inviteMode:     boolean;
    public          state:          GameState = GameState.Stopped;

    public readonly players:        Map<string, Player> = new Map<string, Player>();
    public readonly gameInstance:   GameInstance = new GameInstance(this);

    //private         clients:        Map<string, Socket> = new Map<string, Socket>();

    constructor    ( private server: Server ) {}

    public addClient(client: AuthenticatedSocket, player:Player): void
    {
        if (this.nbPlayers < 2)
        {
            let newPlayer: Player = {
                id: client.id,
                pos: 50,
                score: 0
            }
            this.players.set(client.id, newPlayer);
            
            client.join(this.id);
            client.data.lobby = this;
            
            this.gameInstance.addPlayer(newPlayer);
            this.nbPlayers++;
            
            if (this.nbPlayers == 1)
                client.emit("watingForOpponent");
            else
                this.sendToUsers("gameReady", "Game is ready");
        }
        /*
        this.clients.set(client.id, client.socket);
        client.join(this.id);
        client.data.lobby = this;
        
        if (this.nbPlayers < 2)
        {
            let newPlayer: Player = {
                id: client.id,
                pos: 50,
                score: 0
            }
            this.gameInstance.addPlayer(newPlayer);
            this.nbPlayers++;
            
            if (this.nbPlayers == 1)
            {
                client.emit("watingForOpponent");
                this.gameInstance.state = GameState.Waiting; 
            }
            else
            {
                this.gameIntance.state = GameState.Started;
                this.sendToUsers("gameReady", "Game is ready");
            }
        }
        */


    }

    public startGame()
    {
        this.gameInstance.start();
        this.state = GameState.Started;
    }

    public removeClient(client: AuthenticatedSocket)
    {
        if (this.gameInstance.isPlayer(client.id))
        {
            this.players.delete(client.id)
            client.data.lobby = null;
            client.leave(this.id);
            this.nbPlayers--;
            
            this.players.forEach((player, id) => {
                this.players.delete(id);
            })
            this.gameInstance.stop();
            this.nbPlayers = 0;
            this.state = GameState.Stopped;
            this.sendToUsers('gameStopped', "");
        }
        /*

        client.data.lobby = null;
        client.leave(this.id);
        this.clients.delete(client.id);
        if (this.gameInstance.isPlayer(client.id))
        {
            this.players.forEach((user, id) => {
                this.clients.delete(id);
            })

            this.gameInstance.stop();
            this.nbPlayers = 0;
            this.state = GameState.Stopped;          
            this.sendToUsers('gameStopped', "");  
        }
        */        

    }

    public playersId(): string[] { return this.gameInstance.playersId(); }

    public sendUpdate(event: string, data: GameData) { this.server.to(this.id).emit(event, data); }

    public sendToUsers(event: string, data: any) { this.server.to(this.id).emit(event, data); }

}