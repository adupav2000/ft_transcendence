import React, {useState, useEffect} from "react"
import Ball from "../../Elements/ball"
import Paddle from "../../Elements/paddle"
import Score from "../../Elements/score"
import * as utils from "../../GameUtils/GameUtils"
import "./pong.css"
import { io, Socket } from 'socket.io-client'
import { playerT, playersT, ballInfoT, gameCollionInfoT, gameStateT, updateInfoT, gameDataT} from "../../type"
import {ThreeDots} from "react-loader-spinner";


let socket:Socket

export default function Pong()
{
	const [players, setPlayers] = React.useState<playersT>()
	const [ball, setBall] = React.useState<ballInfoT>()
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
        scoreToWin: 3,
        playerScore: 0,
        computerScore: 0,
		winnerId: ""
    })
	//const [socket, setSocket] = useState<Socket>()

  	const sendPosition = (player:playerT) => {
		socket?.emit("playerPosChanged", player);
	}

	const sendCollisionInfo = (collisionInfo:gameCollionInfoT) => {
		console.log(socket)
		socket?.emit("gameCollisionChange", collisionInfo);
	}

	const joinQueue = () => {
		socket?.emit("joinedQueue", {
			id: socket!.id,
			position: 50,
			score: 0,
		});
		setGameState({
			watingForOpponent: false,
			isPlaying: false,
			isGameFinish: false,
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
		console.log("waitttt")
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
		console.log(socket)
		setGameState((oldState) => ({
			...oldState,
			watingForOpponent: false,
			isPlaying: true
			})
		)
		if (socket.id === id)
			socket?.emit("startGame", gameCollisionInfo);
	}

	function handleMouseMove(event:React.MouseEvent<HTMLDivElement>)
	{
		//HANDLE THE MOUSE MOVE EVENT ON THE GAME AREA
		if (gameState.isPlaying)
		{
			const value:number = (event.clientY / window.innerHeight) * 100
			sendPosition({
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

	useEffect(() => {
		const newSocket = io("http://localhost:8002");
		socket = newSocket;
		newSocket.on("connect", () => {
			console.log(socket)
			
			newSocket.on('watingForOpponent', handleWait)
			newSocket.on('gameReady', (id:string) => handleStart(id))
			newSocket.on('collisionUpdate', () => sendCollisionInfo({
				player1PaddleZone: utils.getPaddleContactZone("player1"),
				player2PaddleZone: utils.getPaddleContactZone("player2"),
				ballZone: utils.getContactZone(),
				borderZone: utils.getContactZone(),
				innerHeight: window.innerHeight,
				innerWidth: window.innerWidth
			}))
			newSocket.on('stateUpdate',(updateInfo:updateInfoT) => handleUpdate(updateInfo))
			newSocket.on('Result',(winnerId:string) => handleGameResult(winnerId))
			//newSocket.on('goalScored', (idScorer:string) => handleGoal(idScorer))
			
		})
		return () => {
			newSocket.off('connect');
			newSocket.off('watingForOpponent');
			newSocket.off('gameReady');
			newSocket.off('stateUpdate');
			newSocket.off('collisionUpdate');
		  };
		}, []);

	

	const playersElements:any = players?.map((elem, index) =>
		<Paddle id={index == 0 ? "player1" : "player2"} key={index} className={index == 0 ? "left" : "right"} position={elem.pos} player={index == 0 ? true :false}/>
		)
		console.log(gameState.isGameFinish)
		console.log(socket?.id)
		console.log(gameState.winnerId)

	return (
		<div className="pong" onMouseMove={handleMouseMove}>
			{
				!gameState.isPlaying && !gameState.watingForOpponent && !gameState.isGameFinish
					&& <button className="buttonStart" onClick={joinQueue}>
						Start Game
					</button>
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
							wrapperClassName=""
							visible={true}
						/>
					</div>
						
			}
			{
					gameState.isGameFinish && 
					<div className="game-display">
						{(socket?.id === gameState.winnerId) ? "YOU WIN" : "YOU LOSE"}
						<button className="buttonStart" onClick={joinQueue}>
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