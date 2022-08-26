import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { string } from 'yargs';

// const options = {
// 	handlePreflightRequest: (req, res) => {
// 	  const headers = {
// 		'Access-Control-Allow-Headers': 'Content-Type, authorization, x-token',
// 		'Access-Control-Allow-Origin': "http://localhost:3000",
// 		"Access-Control-Allow-Methods": "GET,POST",
// 		'Access-Control-Allow-Credentials': true,
// 		'Access-Control-Max-Age': '1728000',
// 		'Content-Length': '0',
// 	  };
// 	  res.writeHead(200, headers);
// 	  res.end();
// 	},
//   }

interface Player { id: string, pos: number}

@WebSocketGateway(8001, { cors: '*' })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{

	players: Player[] = [];
	stateChanged = false;
	isEmittingUpdates = false;

	@WebSocketServer()
	server;

	private logger: Logger = new Logger('AppGateway');

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
			this.server.emit('stateUpdate', this.players);
		}

		if (this.players?.length > 0)
			setTimeout(this.emitUpdates, 300);
		else
			this.isEmittingUpdates = false;
	}

	afterInit(server: Server) {
		this.logger.log("Socket initizialed")

	}

	handleConnection(client: Socket){
		console.log(`Client ${client.id} joined server`);
		let newPlayer: Player = {id: client.id, pos: 50};
		//console.log(newPlayer);
		this.players?.push(newPlayer);
		/*
		for (let i = 0; i < this.players.length; i++)
		{
			console.log(this.players[i]);
		}
		*/
		if (this.players?.length == 1 && !this.isEmittingUpdates)
			this.emitUpdates();
		
		//this.server.emit("clientConnection");
		//this.logger.log(`Client connected: ${client.id}`)
	}

	handleDisconnect(client: Socket) {
		console.log(`Client ${client.id} left server`);
		
		//remove player from players[]

		//this.server.emit("clientDisconnected");
		//this.logger.log(`Client disconnected: ${client.id}`)
	}

	@SubscribeMessage('positionChanged')
	handlePositionChanged(client: Socket, data: { id: string, position: number}) {
		this.stateChanged = true;
		for (let i = 0; i < this.players.length; i++)
		{
			if (this.players[i].id == data.id)
				this.players[i].pos = data.position; 
		}
		//client.broadcast.emit('positionChanged', position);		
	}

	@SubscribeMessage('msgToServer')
	handleMessage(client: Socket, text: string): WsResponse<string> {
		console.log('Message received\n');
		//client.emit('msgToClient', "c'est chaud la");
	return {event: 'msgToClient', data: "c chaud la" };
	}
}
