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
  ball: Ball,
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

export class LobbyQueue {
    elements: Lobby[];
    head: number;
    tail: number;

    constructor() {
      this.elements = [];
      this.head = 0;
      this.tail = 0;
    }
    enqueue(element) {
      this.elements[this.tail] = element;
      this.tail++;
    }
    dequeue() {
      const item = this.elements[this.head];
      delete this.elements[this.head];
      this.head++;
      return item;
    }
    peek() {
      return this.elements[this.head];
    }
    get length() {
      return this.tail - this.head;
    }
    get isEmpty() {
      return this.length === 0;
    }
  }