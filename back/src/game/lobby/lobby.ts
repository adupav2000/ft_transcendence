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

    //public readonly players:        Map<string, Player> = new Map<string, Player>();
    public readonly gameInstance:   GameInstance = new GameInstance(this);

    public         clients:        Map<string, AuthenticatedSocket> = new Map<string, AuthenticatedSocket>();

    constructor    ( private server: Server ) {}

    public addClient(client: AuthenticatedSocket, player:Player): void
    {
        this.clients.set(client.id, client);
        client.join(this.id);
        client.data.lobby = this;
        console.log(this.id)
        
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
                this.gameInstance.state = GameState.Started;
                this.sendToUsers("gameReady", client.id);
            }
        }
        console.log("lobby client ", this.clients.size)
    }

    public startGame(data: any)
    {
        console.log('In startGame');
        this.gameInstance.start(data);
        this.state = GameState.Started;
    }

    public removeClient(client: AuthenticatedSocket)
    {
        client.data.lobby = null;
        client.leave(this.id);
        this.clients.delete(client.id);
        if (this.gameInstance.isPlayer(client.id))
        {
            this.clients.forEach((user, id) => {
                this.clients.delete(id);
            })

            this.gameInstance.stop();
            this.nbPlayers = 0;
            this.state = GameState.Stopped;          
            this.sendToUsers('gameStopped', "");  
        }
               

    }

    public playersId(): string[] { return this.gameInstance.playersId(); }

    public sendUpdate(event: string, data: any) { this.server.to(this.id).emit(event, data); }

    public needUpdate(event: string, data: GameData) { 
		const [firstClient] = this.clients.keys()
		this.server.to(firstClient).emit(event, data); 
    }

    public sendToUsers(event: string, data: any) { this.server.to(this.id).emit(event, data); }

}