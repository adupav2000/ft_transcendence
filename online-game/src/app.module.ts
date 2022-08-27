import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LobbyManager } from './game/lobby/lobby.manager';
import { GameModule } from './game/game.module';

@Module({
  imports: [LobbyManager, GameModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
