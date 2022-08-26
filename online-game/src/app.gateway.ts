import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

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

@WebSocketGateway(8001, { cors: '*' })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	
	@WebSocketServer()
	server;

	private logger: Logger = new Logger('AppGateway');

	afterInit(server: Server) {
		this.logger.log("Socket initizialed")
	}

	handleConnection(client: Socket){
		this.server.emit("clientConnection");
		this.logger.log(`Client connected: ${client.id}`)
	}

	handleDisconnect(client: Socket) {
		this.server.emit("clientDisconnected");
		this.logger.log(`Client disconnected: ${client.id}`)
	}

	@SubscribeMessage('positionChanged')
	handlePositionChanged(client: Socket, position: number) {
		client.broadcast.emit('positionChanged', position);
	}

	@SubscribeMessage('msgToServer')
	handleMessage(client: Socket, text: string): WsResponse<string> {
		console.log('Message received\n');
		//client.emit('msgToClient', "c'est chaud la");
	return {event: 'msgToClient', data: "c chaud la" };
	}
}
