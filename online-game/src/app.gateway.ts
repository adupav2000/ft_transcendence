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
interface Ball {
	x: number,
	y: number,
    dirX: number,
    dirY: number,
    speed: number,
	delta: number
}

@WebSocketGateway(8001, { cors: '*' })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{

	//players: Player[] = [];
	private gameData: { 
		players: Player[],
		ball: Ball
	}
	private stateChanged = false;
	private isEmittingUpdates = false;


	private logger: Logger = new Logger('AppGateway');

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
		//console.log(this.players);
		
		if (this.stateChanged)
		{
			this.stateChanged = false;
			//this.server.emit('stateUpdate', this.gameData?.players);
			this.server.emit('stateUpdate', this.gameData);
		}

		if (this.gameData?.players?.length > 0)
			setTimeout(() => this.emitUpdates(), 30);
	}

	afterInit(server: Server) {
		this.logger.log("Socket initizialed")
		
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
		
		let newPlayer: Player = {id: client.id, pos: 50};

		this.gameData?.players?.push(newPlayer);
		console.log(this.gameData?.players?.length )
		if (this.gameData?.players?.length == 1 && !this.isEmittingUpdates)
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

	@SubscribeMessage('ballPosChanged')
	handleBallPosition(client: Socket, ball: Ball)
	{
		this.stateChanged = true;
		this.gameData.ball = ball;
	}


	@SubscribeMessage('playePosChanged')
	handlePlayerPosition(client: Socket, data: { id: string, position: number}) {
		this.stateChanged = true;
		//console.log('positionChanged');
		for (let i = 0; i < this.gameData?.players.length; i++)
		{
			if (this.gameData.players[i].id == data.id)
				this.gameData.players[i].pos = data.position; 
		}
	}

}
