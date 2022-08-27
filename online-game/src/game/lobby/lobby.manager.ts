import { Cron } from "@nestjs/schedule";
import { WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { AuthenticatedSocket, GameState, LobbyQueue } from "../game.type";
import { Lobby } from "./lobby";

export class LobbyManager
{
    @WebSocketServer()
    public server;

    private readonly lobbies: Map<string, Lobby> = new Map<string, Lobby>();
    private readonly avalaibleLobbies: LobbyQueue = new LobbyQueue();

    public initializeSocket(client: AuthenticatedSocket): void
    {
        client.data.lobby = null;
    }

    public terminateSocket(client: AuthenticatedSocket): void
    {
        client.data.lobby?.removeClient(client);
    }

    public createLobby(): Lobby
    {
        let lobby = new Lobby(this.server);

        //lobby.instance.delayBetweenRounds = delay

        this.lobbies.set(lobby.id, lobby);

        return lobby;
    }

    public joinQueue(client: AuthenticatedSocket)
    {
        let lobby: Lobby;

        if (!this.avalaibleLobbies.isEmpty)
            lobby = this.avalaibleLobbies.dequeue();
        else
            lobby = this.createLobby();

        lobby.addClient(client);
    }

    public joinLobby(lobbyId: string, client: AuthenticatedSocket): void
    {
        this.lobbies[lobbyId].addClient(client);
    }

    @Cron('*\/5 * * * *')
    private lobbiesCleaner(): void
    {
        for (const [lobbyId, lobby] of this.lobbies) {
            if (lobby.state == GameState.Stopped)
                this.lobbies.delete[lobby.id];
        }
    }

}