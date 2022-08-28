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
        var directionX = 0;
		var directionY = 0;
		while (Math.abs(directionX) <= 0.3 || Math.abs(directionX) >= 0.8)
		{
			const trigoDir:number = Math.random() * (0 - (2 * Math.PI))
			directionX = Math.cos(trigoDir)
			directionY = Math.sin(trigoDir)
		}
        this.gameData = {
            players: [],
            ball: {
                x: 50,
                y: 50,
                dirX: directionX,
                dirY: directionY,
                speed: 0.0025,
                delta: 0,
            }
        }
    }

    	// checkPaddleCollision(){
	// 	//CHECK IF THE BALL HITS A PADLLE
	// 	const ballZone:DOMRect = this.gameData.players.at(0).ballZone
	// 	const player1PaddleZone:DOMRect = this.gameData.players.at(0).playerPaddleZone
	// 	const player2PaddleZone:DOMRect = this.gameData.players?.at(1).playerPaddleZone
	// 	if (this.isCollision(ballZone, player1PaddleZone)) {
	// 		return true
	// 	}
	// 	if (this.isCollision(ballZone, player2PaddleZone)) {
	// 		return true
	// 	}
	// 	return false
	// }

	// checkYcollision(){
	// 	//CHECK IF THE BALL HITS THE TOP OR THE BOTTOM
	// 	const contactZone:DOMRect = this.gameData.players.at(0).borderZone
	// 	if (contactZone.bottom >= window.innerHeight 
	// 		|| contactZone.top <= 0) {
	// 			return true
	// 	}
	// 	return false
	// }

	isCollision(rect1:DOMRect, rect2:DOMRect)
	{
		//CHECK IF RECT1 HITS RECT2
		return (
			rect1.left <= rect2.right &&
			rect1.right >= rect2.left &&
			rect1.top <= rect2.bottom &&
			rect1.bottom >= rect2.top
			)
	}

	refreshBall()
	{
		this.gameData.ball.x = this.gameData.ball.x + (this.gameData.ball.dirX * this.gameData.ball.speed * 30)
		this.gameData.ball.y = this.gameData.ball.y + (this.gameData.ball.dirY * this.gameData.ball.speed * 30)
		//this.gameData.ball.dirX = this.checkPaddleCollision() ? this.gameData.ball.dirX * (-1) : this.gameData.ball.dirX
		//this.gameData.ball.dirY = this.checkYcollision() ? this.gameData.ball.dirY * (-1) : this.gameData.ball.dirY
		this.gameData.ball.speed = this.gameData.ball.speed + 0.0001
	}

    //@Interval(30)
    emitUpdateLoop()
    {
        if (this.state == GameState.Started)
        {
            this.refreshBall()
            console.log(this.gameData);
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