import { v4} from "uuid";
import { Server } from "socket.io";
import { AuthenticatedSocket, GameData, GameState, Player } from "../game.type";
import { GameInstance } from "../game.instance";

export class Lobby
{
    public readonly id:             string = v4();
    public          nbPlayers:      number = 0;
    public readonly inviteMode:     boolean;
    public          state:          GameState;

    public readonly players:        Map<string, Player> = new Map<string, Player>();
    public readonly gameInstance:   GameInstance = new GameInstance(this);

    
    constructor( 
        private server: Server
         ) {

            //this.gameInstance = new GameInstance(this);
        }

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
        //this.gameInstance.start();//Pour que le front affiche un ecran d'attente
        this.sendToUsers("gameReady", "Game is ready");
        console.log('In gameStarting');

        /*else
        {
        }*/
    }

    public startGame()
    {
        console.log("In startGame")
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
        for (let i = 0; i < this.players.size; i++)
            this.players.delete(this.players[i].id);

        this.gameInstance.stop();
        this.state = GameState.Stopped;

    }
    public sendUpdate(event: string, data: GameData)
    {
        this.server.emit(event, data);
    }

    public sendToUsers(event: string, data: any)
    {
        this.server.emit(event, data);
    }

}