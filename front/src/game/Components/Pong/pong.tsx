import React, {useState, useEffect} from "react"
import Ball from "../../Elements/ball"
import Paddle from "../../Elements/paddle"
import Score from "../../Elements/score"
import * as utils from "../../GameUtils/GameUtils"
import "../../hooks/useAnimationFrame"
import useAnimationFrame from "../../hooks/useAnimationFrame"
import "./pong.css"
import { io, Socket } from 'socket.io-client'


type gameStateT = {
    isPlaying:boolean,
    scoreToWin:number,
    playerScore:number,
    computerScore:number
}

type gameDataT = {
	time:string,
    scoreToWin:number,
    player1id:number,
    player2id:number,
	player1score:number,
	player2score:number
}

type ballInfoT = {
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    speed: number,
	delta: number
}

type playerT = {
	id:string,
    position:number,
	score:number,
}

type gameCollionInfoT = {
	player1PaddleZone:DOMRect,
	player2PaddleZone:DOMRect,
	ballZone:DOMRect,
	borderZone:DOMRect
	gameArea:number
  }

type playersT = [playerT]

type updateInfoT = {
	players: playersT,
	ball: ballInfoT,
	gameCollionInfo:gameCollionInfoT
}

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
		socket?.emit("startGame");

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
		console.log("Gameready")
		setGameState((oldState) => ({
			...oldState,
			isPlaying: true
			})
		)
	}

		
	useEffect(() => {
		const newSocket = io("http://10.11.10.3:8002");
		socket = newSocket;
		newSocket.on("connect", () => {
			console.log(socket)

			newSocket.on('gameReady', handleStart)
			newSocket.on('stateUpdate',(updateInfo:updateInfoT) => handleUpdate(updateInfo))
			newSocket.on('collisionUpdate', () => sendCollisionInfo({
				player1PaddleZone: utils.getPaddleContactZone("player1"),
				player2PaddleZone: utils.getPaddleContactZone("player2"),
				ballZone: utils.getContactZone(),
				borderZone: utils.getContactZone(),
				gameArea: window.innerHeight
			}))
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

	//FONCTION NON APPELLER A TESTER AVEC LE BACKEND
	async function sendData ()
	{
		//INFO SUR LA PARTIE A ENVOYER A LA BASE DE DONNÉE
		//DES INFO PEUVENT MANQUÉ
		const gameData:gameDataT = {
			time: Date(),
			scoreToWin: gameState.scoreToWin,
			player1id: 1, //ON RECUPERERA LES VRAIS ID DES JOUEUR
			player2id: 2,
			player1score: gameState.playerScore,
			player2score:gameState.computerScore
		}
		console.log(JSON.stringify(gameData))
		//EXEMPLE D'ENVOIE EN COMMENTAIRE A TESTER
	// 	const url:string = "http://localhost:3000/game"
	// 	await fetch(url, {
	//     method: 'POST',
	//     body: JSON.stringify(gameData)
	//   }).then(function(response) {
	//     console.log(response)
	//     return response.json();
	//   });

	}

	function setRoundWin()
	{
		//CHECK WHO WIN AND CHANGE STATE VALUE OF SCORE
		const contactZone:DOMRect = utils.getContactZone()
		if (contactZone.right >= window.innerWidth)
		{
			setGameState((oldGameState) => ({
				...oldGameState,
				playerScore: oldGameState.playerScore + 1
			}))
		}
		else if (contactZone.left <= 0) 
		{
			setGameState((oldGameState) => ({
				...oldGameState,
				computerScore: oldGameState.computerScore + 1
			}))
		}
	}

	function isWin()
	{
		//CHECK IF SOMEONE WINS
		if (gameState.playerScore === gameState.scoreToWin
			|| gameState.computerScore === gameState.scoreToWin)
			return true
		return false
	}
	const playersElements:any = players?.map((elem, index) =>
		<Paddle id={index == 0 ? "player1" : "player2"} key={index} className={index == 0 ? "left" : "right"} position={elem.pos} player={index == 0 ? true :false}/>
		)
	return (
		<div className="pong" onMouseMove={handleMouseMove}>
			{
				!gameState.isPlaying && 
					<button className="buttonStart" onClick={joinQueue}>
						Start Game
					</button>
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

	//            <Ball isPlaying={gameState.isPlaying}/>
