import { Socket } from "socket.io";
import { Lobby } from "./lobby/lobby";

export interface Player 
{ 
    id: string,
    pos: number,
    score: number
}

export interface Ball {
	x: number,
	y: number,
  dirX: number,
  dirY: number,
  speed: number,
	delta: number
}

export interface gameCollionInfoT {
  player1PaddleZone:DOMRect,
  player2PaddleZone:DOMRect,
  ballZone:DOMRect,
  borderZone:DOMRect
  innerHeight:number,
  innerWidth:number
}

export interface GameData{
  players: Player[],
  ball: Ball,
  gameCollisionInfo:gameCollionInfoT
}

export interface GameSettings {
  scoreToWin: number,
  
}


export type AuthenticatedSocket = Socket & {
	data: {
		lobby: null | Lobby;
	}
}

export enum GameState {
  Started,
  Stopped,
  Waiting,
  Goal,
}
