
export type gameStateT = {
    watingForOpponent:boolean,
    isPlaying:boolean,
    isGameFinish:boolean,
    invalidLobbyId: boolean,
    scoreToWin:number,
    playerScore:number,
    computerScore:number
    winnerId: string
}

export type gameDataT = {
	time:string,
    scoreToWin:number,
    player1id:number,
    player2id:number,
	player1score:number,
	player2score:number
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
