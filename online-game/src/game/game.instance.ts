import { Lobby } from "./lobby/lobby";
import { AuthenticatedSocket, Ball, GameData, GameState, Player } from "./game.type";
import { Interval } from "@nestjs/schedule";

export class GameInstance
{
    private stateChanged = false;
	private isEmittingUpdates = false;
    
    private gameData:   GameData;

    private state:       GameState;

    constructor(public lobby: Lobby) {
        this.gameData = {
            players: [],
            ball: {
                x: 0,
                y: 0,
                dirX: 0,
                dirY: 0,
                speed: 0,
                delta: 0,
            }
        }
    }

    //@Interval(30)
    emitUpdateLoop()
    {
        this.state = GameState.Started;
        if (this.state == GameState.Started)
        {
            //console.log(this.gameData);
            this.lobby.sendUpdate("stateUpdate", this.gameData);
        }

		if (this.gameData?.players?.length > 0)
			setTimeout(() => this.emitUpdateLoop(), 30);

    }

    public start()
    {
        this.state = GameState.Started;
        this.emitUpdateLoop();
    }

    public stop()
    {
        this.gameData.players = [];
        this.state = GameState.Stopped;
    }

    public addPlayer(player: Player)
    {
        this.gameData.players.push(player);
    }

    public playerMoved(client: AuthenticatedSocket, data: { id: string, position: number})
    {
        this.stateChanged = true;
		for (let i = 0; i < this.gameData?.players.length; i++)
		{
			if (this.gameData.players[i].id == data.id)
				this.gameData.players[i].pos = data.position;
		}
    }

    //Temporary
    public ballMoved(client: AuthenticatedSocket, ball: Ball)
    {
        this.stateChanged = true;
        this.gameData.ball = ball;
    }
}