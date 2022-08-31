import React, {useState, useEffect} from "react"
import Ball from "../../Elements/ball"
import Paddle from "../../Elements/paddle"
import Score from "../../Elements/score"
import * as utils from "../../GameUtils/GameUtils"
import "./pong.css"
import { playerT, playersT, ballInfoT, gameCollionInfoT, gameStateT, updateInfoT, gameDataT} from "../../type"
import {ThreeDots} from "react-loader-spinner";
import * as socketManager from "../../socketManager"
import { io, Socket } from 'socket.io-client'

let socket:Socket

export default function Pong()
{
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
}