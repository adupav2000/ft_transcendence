import { v4} from "uuid";
import { Server } from "socket.io";
import { AuthenticatedSocket, GameData, GameState, Player } from "../game.type";
import { GameInstance } from "../game.instance";

export class Lobby
{
    public readonly id:             string = v4();
    public          nbPlayers:      number = 0;
    public readonly inviteMode:     boolean;
    public          state:          GameState = GameState.Stopped;

    public readonly players:        Map<string, Player> = new Map<string, Player>();
    public readonly gameInstance:   GameInstance = new GameInstance(this);

    
    constructor    ( private server: Server ) {}

    public addClient(client: AuthenticatedSocket): void
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
        // this..gameInstance.state = GameState.Waiting;
        // else { 
        this.sendToUsers("gameReady", "Game is ready");


    }

    public startGame()
    {
        this.gameInstance.start();
        this.state = GameState.Started;
    }

    public removeClient(client: AuthenticatedSocket)
    {
        this.players.delete(client.id)
        client.data.lobby = null;
        client.leave(this.id);
        this.nbPlayers--;
        
        //this.sendToUsers('ennemyLeft', "Ennemy left the game") //Pour que le front arrete le jeu
        this.players.forEach((player, id) => {
            this.players.delete(id);
        })
        console.log(this.players.size);
        this.gameInstance.stop();
        this.state = GameState.Stopped;
        this.sendToUsers('gameStopped', "");        

    }
    public sendUpdate(event: string, data: GameData)
    {
        this.server.to(this.id).emit(event, data);
    }

    public sendToUsers(event: string, data: any)
    {
        this.server.to(this.id).emit(event, data);
    }

}