import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChannelManager } from './channel/channel.manager';

@Module({
    providers: [ChannelManager, ChatGateway]
})
export class ChatModule {}
