import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { string } from 'yargs';
import { LobbyManager } from './lobby/lobby.manager';
import { AuthenticatedSocket, Ball, Player } from './game.type';


@WebSocketGateway(8001, { cors: '*' })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{

	private gameData: { 
		players: Player[],
		ball: Ball
	}
	private stateChanged = false;
	private isEmittingUpdates = false;

	constructor( private lobbyManager: LobbyManager) {	}

	@WebSocketServer()
	server;

	createClient(id: string) {
		return {
			id: id,
			pos: 0,
		}
	}

	emitUpdates() {
		this.isEmittingUpdates = true;
		
		if (this.stateChanged)
		{
			this.stateChanged = false;
			this.server.emit('stateUpdate', this.gameData);
		}

		if (this.gameData?.players?.length > 0)
			setTimeout(() => this.emitUpdates(), 30);
	}

	afterInit(server: Server) {
		
		this.lobbyManager.server = server;

		this.gameData = {
			players: [],
			ball:
				{
					x: 0,
					y: 0,
					dirX: 0,
					dirY: 0,
					speed: 0,
					delta: 0,
				}
		}
	}

	handleConnection(client: Socket){
		console.log(`Client ${client.id} joined server`);
		
		this.lobbyManager.initializeSocket(client as AuthenticatedSocket);

		/*
		
		let newPlayer: Player = {id: client.id, pos: 50};

		this.gameData?.players?.push(newPlayer);
		console.log(this.gameData?.players?.length )
		if (this.gameData?.players?.length == 1 && !this.isEmittingUpdates)
			this.emitUpdates();
		*/
	}

	handleDisconnect(client: AuthenticatedSocket) {
		console.log(`Client ${client.id} left server`);
		this.lobbyManager.terminateSocket(client);
		
	}

	//Futur startGame event
	@SubscribeMessage('createLobby')
	createLobby(client: AuthenticatedSocket)
	{
		let lobby = this.lobbyManager.createLobby();
		lobby.addClient(client);

		client.emit("lobbyCreated", "Successful creation");
	}

	@SubscribeMessage('joinedQueue')
	joinQueue(client: AuthenticatedSocket)
	{
		this.lobbyManager.joinQueue(client);
	}


	@SubscribeMessage('ballPosChanged')
	handleBallPosition(client: Socket, ball: Ball)
	{
		this.stateChanged = true;
		this.gameData.ball = ball;
	}


	@SubscribeMessage('playerPosChanged')
	handlePlayerPosition(client: AuthenticatedSocket, data: { id: string, position: number}) {
		client.data.lobby.gameInstance.playerMoved(client, data);

	}

}
