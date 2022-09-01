import React, {useState, useEffect, useRef} from "react"
import Ball from "../../Elements/ball"
import Paddle from "../../Elements/paddle"
import Score from "../../Elements/score"
import * as utils from "../../GameUtils/GameUtils"
import "./pong.css"
import { playerT, playersT, ballInfoT, gameCollionInfoT, updateInfoT, gameDataT, GameSettings, GameData, GameState} from "../../type"
import {ThreeDots} from "react-loader-spinner";
import * as socketManager from "../../socketManager"
import { io, Socket } from 'socket.io-client'

let socket:Socket

export default function Pong()
{
/*
	const [players, setPlayers] = React.useState<playersT>()
	const [ball, setBall] = React.useState<ballInfoT>()
	const [input, setInput] = React.useState<string>("")
	const [gameCollisionInfo, setGameCollisonInfo] = React.useState<gameCollionInfoT>({
		player1PaddleZone: new DOMRect(),
		player2PaddleZone:  new DOMRect(),
		ballZone:  new DOMRect(),
		borderZone:  new DOMRect(),
		innerHeight: 0,
		innerWidth: 0
	})
	const [gameState, setGameState] = React.useState<gameStateT>({
        watingForOpponent: false,
        isPlaying: false,
		isGameFinish: false,
		invalidLobbyId: false,
        scoreToWin: 3,
        playerScore: 0,
        computerScore: 0,
		winnerId: ""
    })
	//const [socket, setSocket] = useState<Socket>()

	function joiningQueue(player:playerT)
	{
		socketManager.joinQueue(player)
		setGameState({
			watingForOpponent: false,
			isPlaying: false,
			isGameFinish: false,
			invalidLobbyId: false,
			scoreToWin: 3,
			playerScore: 0,
			computerScore: 0,
			winnerId: ""
		})
	}

	const handleWait = () => {
		setGameState((oldState) => ({
			...oldState,
			watingForOpponent: true,
			})
		)
	}

	// function handleGoal(idScorer:string) {
	// 	setPlayers((oldPlayers?) => (oldPlayers?.map((player) => {
	// 		if (player.id === idScorer)
	// 			return { ...player, score: player.score + 1}
	// 		return player
	// 		}
	// 	)))
	// }

	function setStates(updateInfo:updateInfoT)
	{
		setPlayers(updateInfo.players)
		setBall(updateInfo.ball)
		if (updateInfo.players !== undefined && updateInfo.players?.length > 1)
		{
			const collisionInfo:gameCollionInfoT = {
				player1PaddleZone: utils.getPaddleContactZone("player1"),
				player2PaddleZone: utils.getPaddleContactZone("player2"),
				ballZone: utils.getContactZone(),
				borderZone: utils.getContactZone(),
				innerHeight: window.innerHeight,
				innerWidth: window.innerWidth
			}
			setGameCollisonInfo(collisionInfo)
		}
	}

	function handleUpdate(updateInfo:updateInfoT)
	{
		setStates(updateInfo)
	}

	const handleStart = (id: string) => {
		setGameState((oldState) => ({
			...oldState,
			watingForOpponent: false,
			isPlaying: true
			})
		)
		gameCollisionInfo.innerHeight = window.innerHeight;
		gameCollisionInfo.innerWidth = window.innerWidth;
		if (socket?.id === id)
			socketManager.startGame(gameCollisionInfo)
}

	function handleMouseMove(event:React.MouseEvent<HTMLDivElement>)
	{
		//HANDLE THE MOUSE MOVE EVENT ON THE GAME AREA
		if (gameState.isPlaying)
		{
			const value:number = (event.clientY / window.innerHeight) * 100
			socketManager.sendPosition({
				id: socket!.id,
				position: value,
				score: 0,
			})
		}
	}
		
	function handleGameResult(winnerId:string)
	{
		setGameState((oldGameState) => ({
			...oldGameState,
			isPlaying: false,
			isGameFinish: true,
			winnerId: winnerId
		}))
	}

	function handleError(errorMessage:string)
	{
		console.log("laaaa")
		setGameState((oldGameState) => ({
			...oldGameState,
			isPlaying: false,
			invalidLobbyId: true
		}))
	}

	useEffect(() => {
		socketManager.initiateSocket("http://localhost:8002")
		socketManager.listenGame(handleWait, handleStart, handleUpdate, handleGameResult, handleError)
		socket = socketManager.getSocket()
		ull
		console.log(socket)
		return () => {
			socketManager.cleanUp()
		  }
		}, []);

	function spectateMode(id:string)
	{
		console.log(id)
		setGameState((oldState) => ({
			...oldState,
			watingForOpponent: false,
			isPlaying: true,
			invalidLobbyId: false
			}))
			socketManager.spectacteGame(id)
	}
	
	function handleChange(e:any) {
		setInput(e.target.value);
		}

	function handleSubmit(e:any)
	{
		if (input !== undefined)
			spectateMode(input)
		e.preventDefault();
	}

	const playersElements:any = players?.map((elem, index) =>
		<Paddle id={index == 0 ? "player1" : "player2"} key={index} className={index == 0 ? "left" : "right"} position={elem.pos} player={index == 0 ? true :false}/>
		)

*/
	let context: CanvasRenderingContext2D;
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [canvas, setCanvas] = useState<HTMLCanvasElement>();
	const [isDrawing, setDrawing] = useState(false);
	
	const [gameData, setGameData] = useState<GameData>({
		players: [{
			id: "",
			pos: 1080 / 2,
			score: 0,
		}, 
		{
			id: "",
			pos: 1080 / 2,
			score: 0,

		}],
		ball : {
			x: 1920 / 2,
			y: 1080 / 2,
			speed: 0.01,
			delta: {x: 0, y: 0},
			radius: 10,
		},
		state: GameState.Waiting,
	});

	const [settings, setSettings] = useState<GameSettings>({
		scoreToWin: 5,
		paddleWidth: 50,
		paddleHeight: 200,
		width: 1920,
		height: 1080,
	});

	function setContext(newContext: CanvasRenderingContext2D){ context = newContext; }
	
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas)
			return ;
/*
		canvas.width = window.innerWidth; // Get parent width
		canvas.height = window.innerHeight; // Get parent height
		canvas.style.width = `${window.innerWidth}px`;
		canvas.style.height = `${window.innerHeight}px`;
	*/
		const newContext = canvas.getContext("2d");
		if (!newContext)
			return ;

		const handleResize = () => {
			canvas.height = window.innerHeight;
			canvas.width = window.innerWidth;
		}	
		handleResize();
		window.addEventListener('resize', handleResize);

		setCanvas(canvas);
		setContext(newContext)

		socket = io("http://localhost:8002");
		socket.on('updateBall', (ball) => {
			gameData.ball = ball;
			draw(0, 0);
		})
		socket.on('updatePaddle', ({playerId, newPos}) => {
			updatePaddle(playerId, newPos);
		})
		socket.on('gameReady', (data: GameData) => {
			gameData.ball = data.ball;
			gameData.players = data.players;
			gameData.state = GameState.Started;
			socket.emit("startGame");
		})

		

	}, [])

	function updatePaddle(playerId: string, newPos: number)
	{
		if (gameData.players[0].id == playerId)
			gameData.players[0].pos = newPos;
		else
			gameData.players[1].pos = newPos;
	}

	function handleMouseMove(event:React.MouseEvent<HTMLCanvasElement>)
	{
		//HANDLE THE MOUSE MOVE EVENT ON THE GAME AREA
		if (gameData.state == GameState.Started)
		{
			let value: number = event.clientY;

			if (value + settings.paddleHeight / 2 >= settings.height)
				value = settings.height - settings.paddleHeight / 2;
			else if (value - settings.paddleHeight / 2 <= 0)
				value = settings.paddleHeight / 2;
			socket.emit("playerMoved", value);
			/*socketManager.sendPosition({
				id: socket!.id,
				position: value,
				score: 0,
			})
			*/
		}
	}

	function draw(x: number, y: number) {
		
		console.log(gameData.players[0].pos);
		if (y > 1000)
			return ;
		if (!context)
			return ;
		context.clearRect(
			0,
			0,
			1920,
			1080,
		);
		context.beginPath();

		context.fillRect(0,
			gameData.players[0].pos - settings.paddleHeight / 2,
			settings.paddleWidth,
			settings.paddleHeight);

		context.fillRect(settings.width - settings.paddleWidth - 40, // ?????
			gameData.players[1].pos - settings.paddleHeight / 2,
			settings.paddleWidth,
			settings.paddleHeight);

		context.fillStyle = "white";
		context?.arc(gameData.ball.x, gameData.ball.y, 20, 0, 2 * Math.PI)

		context?.fill();
		context?.closePath();

		//setTimeout(() => { draw(x +20, y + 20) }, 50)
	}

	return (
		<div id="canvasDiv">
		<canvas
		className="pong"
		width="1920"
		height="1080"
		ref={canvasRef}
		onMouseMove={handleMouseMove}
		
		/>
		<button className="buttonStart" onClick={() => socket.emit('joinedQueue') /*draw(1920 / 2, 1080 / 2)*/}></button>
		</div>
	);
	
/*
	return (
		<div className="pong" onMouseMove={handleMouseMove}>
			{
				!gameState.isPlaying && !gameState.watingForOpponent && !gameState.isGameFinish
					&& <div className="game-display">
						<button className="buttonStart" onClick={() => joiningQueue({ id: socket!.id,
																				position: 50,
																				score: 0,
																			})}>
							Start Game
						</button>
						<form onSubmit={handleSubmit}>
							<input type="text" value={input} onChange={handleChange}/>
							<input type="submit" value="Rechercher"/>
						</form>
						{gameState.invalidLobbyId && <p style={{
							color: "red"
						}}>This lobby does not exist anymore</p>}
					</div> 
			}
			{
				gameState.watingForOpponent &&
					<div className="game-display">
						<h1 style={{
							color: "white"
						}}>Waiting for Player</h1>
						<ThreeDots 
							height="80" 
							width="80" 
							radius="9"
							color="#00ffff" 
							ariaLabel="three-dots-loading"
							wrapperStyle={{}}
							visible={true}
						/>
					</div>
						
			}
			{
					gameState.isGameFinish && 
					<div className="game-display">
						{(socket?.id === gameState.winnerId) ? "YOU WIN" : "YOU LOSE"}
						<button className="buttonStart" onClick={() => joiningQueue({ id: socket!.id,
																				position: 50,
																				score: 0,
																			})}>
							Restart Game
						</button>
						</div>
					
			}
			{
				gameState.isPlaying &&
				<Score player1Score={players?.at(0)?.score!} player2Score={players?.at(1)?.score!}/>
			}
			{playersElements}
			{
				players === undefined && 
				<Paddle id="player1" className="left" position={50} player={true}/>
			}
			{
				(players?.length === 1 || players === undefined) && 
				<Paddle id="player2" className="right" position={50} player={false}/>
			}
			<Ball isPlaying={gameState.isPlaying} x={ball?.x} y={ball?.y}/>
		</div>
	)
*/
}