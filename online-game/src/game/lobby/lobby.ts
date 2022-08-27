import { v4} from "uuid";
import { Server } from "socket.io";
import { AuthenticatedSocket, GameState, Player } from "../game.type";
import { GameInstance } from "../game.instance";

export class Lobby
{
    public readonly id:             string = v4();
    public          nbPlayers:      number = 0;
    public readonly inviteMode:     boolean;
    public          state:          GameState;

    public readonly players:        Map<string, Player> = new Map<string, Player>();
    public readonly gameInstance:   GameInstance = new GameInstance(this);

    
    constructor( private server: Server ) {}

    public addClient(client: AuthenticatedSocket): void
    {
        let newPlayer: Player = {
            id: client.id,
            pos: 50,
            score: 0,
            socket: client
        }
        this.players.set(client.id, newPlayer);
        
        client.join(this.id);
        client.data.lobby = this;
        
        this.nbPlayers++;

        if (this.nbPlayers == 1)
            client.emit("watingForOpponent"); //Pour que le front affiche un ecran d'attente
        else
        {
            this.sendToUsers("gameStarting", "Game has started");
            this.gameInstance.start();
        }
    }

    public removeClient(client: AuthenticatedSocket)
    {
        this.players.delete(client.id)
        client.data.lobby = null;
        client.leave(this.id);
        this.nbPlayers--;
        
        this.sendToUsers('ennemyLeft', "Ennemy left the game") //Pour que le front arrete le jeu
        for (let i = 0; i < this.players.size; i++)
            this.players.delete(this.players[i].id);

        this.gameInstance.stop();

    }

    public sendToUsers<T>(event: string, data: T)
    {
        this.server.to(this.id).emit(event, data);
    }

}