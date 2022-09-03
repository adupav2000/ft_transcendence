import { NotFoundException } from "@nestjs/common";
import { Cron, Interval } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { WebSocketServer } from "@nestjs/websockets";
import { Repository } from "typeorm";
import { AuthenticatedSocket } from "../types/channel.type";
import { Channel } from "./channel";

export class ChannelManager
{
    @WebSocketServer()
    public server;

    private readonly channels: Map<string, Channel> = new Map<string, Channel>();

    constructor() { }

    public initializeSocket(client: AuthenticatedSocket): void
    {
        client.data.channel = null;
    }

    public terminateSocket(client: AuthenticatedSocket): void
    {
        client.data.channel?.removeClient(client);
    }

    public createChannel(channelId: string): Channel
    {
        let channel = new Channel(this.server, channelId);

        this.channels.set(channel.id, channel);

        return channel;
    }

    public joinChannel(client: AuthenticatedSocket, channelId: string)
    {        
        const channel: Channel = this.channels.get(channelId);
        if (channel?.addClient(client) == undefined)
            throw new NotFoundException("This channel does not exist anymore");
        channel.sendToUsers("joinedChannel", client.id);
    }
   
    public getChannel(channelId: string)
    {
        const channel: Channel = this.channels.get(channelId);
        if (channel == undefined)
            throw new NotFoundException("This channel does not exist anymore");
        return channel;
    }

    public getActiveChannels()
    {
        let res:{channelId: string, clientsId: string[]}[] = [];

        console.log(this.channels)

        this.channels.forEach((channel, id) => {
            if (channel.getNbClients() > 0)
            {
                res.push({
                    channelId: id,
                    clientsId: channel.clientsId(),
                })
            }
        });
        return res;
        
    }

    //Deletes stopped channels every minutes
    @Interval(60 * 1000)
    private channelsCleaner(): void
    {
        console.log(`Avalaible channels: ${this.channels.size}`);
        this.channels.forEach((channel, id) => {
            if (channel.getNbClients() == 0)
            {
                this.channels.delete(id);
            }
        });
        console.log(`Active channels: ${this.channels.size}`);
    }

}