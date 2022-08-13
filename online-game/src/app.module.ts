import { Module } from '@nestjs/common';
import { AppController } from './app.controler';
import { AppGateway } from './app.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [AppGateway],
})
export class AppModule {}
