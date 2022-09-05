

export enum GameState {
	Started,
	Stopped,
	Waiting,
	Goal,
  }

export type gameDataT = {
	time:string,
    scoreToWin:number,
    player1id:number,
    player2id:number,
	player1score:number,
	player2score:number
}

export interface Player 
{ 
    id: string,
    pos: number,
    score: number
}

export interface Paddle {
	height: number,
	width: number,
}

export interface Ball {
	x: number,
	y: number,
  speed: number,
  delta: { x: number, y: number},
	radius: number
}

export interface GameData{
  players: Player[],
  ball: Ball,
  state: GameState
}

export interface GameSettings {
  scoreToWin: number,
  paddleWidth:	number,
  paddleHeight:	number,
  width: number,
  height: number,
  
}

export type ballInfoT = {
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    speed: number,
	delta: number
}

export type playerT = {
	id:string,
    position:number,
	score:number,
}

export type gameCollionInfoT = {
	player1PaddleZone:DOMRect,
	player2PaddleZone:DOMRect,
	ballZone:DOMRect,
	borderZone:DOMRect
	innerHeight:number
	innerWidth:number
  }

export type playersT = playerT[]

export type updateInfoT = {
	players: playersT,
	ball: ballInfoT,
	gameCollionInfo:gameCollionInfoT
}

export type availableLobbiesT = [{
    lobbyId: string;
    playersId: string[];
}]
