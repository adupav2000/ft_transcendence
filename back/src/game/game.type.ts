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

export interface GameData{
  players: Player[],
  ball: Ball;
}


export type AuthenticatedSocket = Socket & {
	data: {
		lobby: null | Lobby;
	}
}

export enum GameState {
  Started,
  Stopped,
}
