import io from 'socket.io-client';
import * as utils from "../GameUtils/GameUtils"

class GameSocket {
    socket:any
    init(serverUrl:string, handleStart:any, handleUpdate:any) {
      this.socket = io(serverUrl);
      this.socket.on('connect', () => {
        // Get self ID from the connected socket and store
        this.socket.on('gameReady', handleStart)
        this.socket.on('stateUpdate',(updateInfo:any) => handleUpdate(updateInfo))
        this.socket.on('collisionUpdate', () => this.sendCollisionInfo({
            player1PaddleZone: utils.getPaddleContactZone("player1"),
            player2PaddleZone: utils.getPaddleContactZone("player1"),
            ballZone: utils.getContactZone(),
            borderZone: utils.getContactZone(),
            gameArea: window.innerHeight
        }))
      });
    }
    sendPosition(player:any){
		this.socket?.emit("playerPosChanged", player);
	}

	sendCollisionInfo(collisionInfo:any){
		this.socket?.emit("gameCollisionChange", collisionInfo);
	}

	joinQueue(){
		this.socket?.emit("joinedQueue", {
			id: this.socket!.id,
			position: 50,
			score: 0,
		});
		this.socket?.emit("startGame");

	}
  }
  
  const gameSocket = new GameSocket();
  
  export default gameSocket;