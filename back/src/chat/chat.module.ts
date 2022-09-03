import { Module } from '@nestjs/common';
import { GameGateway } from './chat.gateway';
import { LobbyManager } from './channel/channel.manager';

@Module({
    providers: [LobbyManager, GameGateway]
})
export class GameModule {}
