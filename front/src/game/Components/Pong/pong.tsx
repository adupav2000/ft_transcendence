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
		gameArea: 0
	})
	const [gameState, setGameState] = React.useState<gameStateT>({
        watingForOpponent: false,
        isPlaying: false,
        scoreToWin: 3,
        playerScore: 0,
        computerScore: 0
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
	}

	const handleWait = () => {
		setGameState((oldState) => ({
			...oldState,
			watingForOpponent: true,
			})
		)
		console.log("waitttt")
	}

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
				gameArea: window.innerHeight
			}
			setGameCollisonInfo(collisionInfo)
		}
	}

	function handleUpdate(updateInfo:updateInfoT)
	{
		setStates(updateInfo)
	}

	const handleStart = () => {
		console.log(socket)
		setGameState((oldState) => ({
			...oldState,
			watingForOpponent: false,
			isPlaying: true
			})
		)
		socket?.emit("startGame");
	}

		
	useEffect(() => {
		const newSocket = io("http://10.11.10.3:8002");
		socket = newSocket;
		newSocket.on("connect", () => {
			console.log(socket)

			newSocket.on('watingForOpponent', handleWait)
			newSocket.on('gameReady', handleStart)
			newSocket.on('collisionUpdate', () => sendCollisionInfo({
				player1PaddleZone: utils.getPaddleContactZone("player1"),
				player2PaddleZone: utils.getPaddleContactZone("player2"),
				ballZone: utils.getContactZone(),
				borderZone: utils.getContactZone(),
				gameArea: window.innerHeight
			}))
			newSocket.on('stateUpdate',(updateInfo:updateInfoT) => handleUpdate(updateInfo))
			
		})
		return () => {
			newSocket.off('connect');
			newSocket.off('gameReady');
			newSocket.off('stateUpdate');
			newSocket.off('collisionUpdate');
		  };
		}, []);

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
			// if (players !== undefined && players?.length > 1)
			// {
			// 	sendCollisionInfo({
			// 		player1PaddleZone: utils.getPaddleContactZone("player1"),
			// 		player2PaddleZone: utils.getPaddleContactZone("player2"),
			// 		ballZone: utils.getContactZone(),
			// 		borderZone: utils.getContactZone(),
			// 		gameArea: window.innerHeight
			// 	})
			// }
		}
	}

	const playersElements:any = players?.map((elem, index) =>
		<Paddle id={index == 0 ? "player1" : "player2"} key={index} className={index == 0 ? "left" : "right"} position={elem.pos} player={index == 0 ? true :false}/>
		)

	return (
		<div className="pong" onMouseMove={handleMouseMove}>
			{
				!gameState.isPlaying && !gameState.watingForOpponent && 
					<button className="buttonStart" onClick={joinQueue}>
						Start Game
					</button>
			}
			{
				gameState.watingForOpponent &&
					<div className="waiting">
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
			<Score playerScore={gameState.playerScore} computerScore={gameState.computerScore}/>
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