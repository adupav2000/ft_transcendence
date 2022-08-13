import { NestApplication, NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import * as cors from 'cors'
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true });
	// const options = {
	// 	"origin":true,  // attempted "origin":["http://localhost"]
	// 	"methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
	// 	"preflightContinue": false,
	// 	"optionsSuccessStatus": 200,
	// 	"credentials":true,
	// 	"allowedHeaders": "Content-Type, Accept,Authorization",
	
	//   }
	const whitelist = ['http://localhost:3000'];

	const corsOptionsDelegate = function (req, callback) {
	  let corsOptions;
	  if (whitelist.indexOf(req.header('Origin')) !== -1) {
		corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
	  } else {
		corsOptions = { origin: false }; // disable CORS for this request
	  }
	  callback(null, corsOptions); // callback expects two parameters: error and options
	};
  
	app.use(cors(corsOptionsDelegate));
	app.useWebSocketAdapter(new IoAdapter());
	// app.use((req, res, next) => {
	// 	res.setHeader("Access-Control-Allow-Origin", "*");
	// 	res.header(
	// 	  "Access-Control-Allow-Headers",
	// 	  "Origin, X-Requested-With, Content-Type, Accept, Authorization"
	// 	);
	// 	next();
	//   });
	// app.enableCors({
	// 	credentials: true,
	// 	origin: ["http://localhost:3000"],
	// 	methods: "GET"
	// 	});
	await app.listen(3001);
}
bootstrap();