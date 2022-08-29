import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { string } from 'yargs';
import { LobbyManager } from './lobby/lobby.manager';
import { AuthenticatedSocket, Ball, gameCollionInfoT, Player } from './game.type';
import { GameInstance } from './game.instance';


@WebSocketGateway(8002, { cors: '*' })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{

	constructor( private lobbyManager: LobbyManager) {	}

	@WebSocketServer()
	server;


	afterInit(server: Server) {
		
		this.lobbyManager.server = server;
	
	}

	handleConnection(client: Socket){
		console.log(`Client ${client.id} joined server`);
		
		this.lobbyManager.initializeSocket(client as AuthenticatedSocket);
		
	}

	handleDisconnect(client: AuthenticatedSocket) {
		console.log(`Client ${client.id} left server`);
		this.lobbyManager.terminateSocket(client);
		
	}

	@SubscribeMessage('createLobby')
	createLobby(client: AuthenticatedSocket, player:Player)
	{
		let lobby = this.lobbyManager.createLobby();
		lobby.addClient(client, player);

		client.emit("lobbyCreated", "Successful creation");
	}

	@SubscribeMessage('joinedQueue')
	joiningQueue(client: AuthenticatedSocket, player:Player)
	{
		console.log(`Client ${client.id} joined queue`)
		this.lobbyManager.joinQueue(client, player);
	}

	@SubscribeMessage('startGame')
	launchGame(client: AuthenticatedSocket)
	{
		client.data.lobby.startGame();
	}

	@SubscribeMessage('ballPosChanged')
	handleBallPosition(client: Socket, ball: Ball)
	{
        console.log('In ballchanged');
		//Add ball function
	}


	@SubscribeMessage('playerPosChanged')
	handlePlayerPosition(client: AuthenticatedSocket, data: { id: string, position: number}) {
		client.data.lobby?.gameInstance.playerMoved(client, data);

	}
	@SubscribeMessage('gameCollisionChange')
	handleGameCollision(client: AuthenticatedSocket, data: gameCollionInfoT) {
		client.data.lobby?.gameInstance.changeCollisionInfo(client, data);
	}

}
