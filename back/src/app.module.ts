import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LobbyManager } from './game/lobby/lobby.manager';
import { GameModule } from './game/game.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    GameModule,
    ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
