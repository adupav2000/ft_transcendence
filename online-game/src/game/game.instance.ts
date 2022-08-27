import { Lobby } from "./lobby/lobby";
import { AuthenticatedSocket, Ball, GameState, Player } from "./game.type";

export class GameInstance
{
    private stateChanged = false;
	private isEmittingUpdates = false;
    
    private gameData: {
        players: Player[],
        ball: Ball,
    }

    constructor(public lobby: Lobby) {
    }

    emitUpdateLoop()
    {
        if (this.stateChanged)
        {
            this.stateChanged = false;
            this.lobby.sendToUsers("stateUpdate", this.gameData);
        }

		if (this.gameData?.players?.length > 0)
			setTimeout(() => this.emitUpdateLoop(), 30);

    }

    public start()
    {
        this.emitUpdateLoop();
        this.lobby.state = GameState.Started;
    }

    public stop()
    {
        this.gameData.players = [];
        this.lobby.state = GameState.Stopped;
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