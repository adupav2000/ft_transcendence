import { NestApplication, NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import * as cors from 'cors'
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import { createServer } from 'http';

async function bootstrap() {
	// const options = {
	// 	"origin":true,  // attempted "origin":["http://localhost"]
	// 	"methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
	// 	"preflightContinue": false,
	// 	"optionsSuccessStatus": 200,
	// 	"credentials":true,
	// 	"allowedHeaders": "Content-Type, Accept,Authorization",
	
	//   }
	const app = await NestFactory.create(AppModule);
	
	
	await app.listen(3001);
}
bootstrap();