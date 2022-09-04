import { Lobby } from "./lobby/lobby";
import { Player } from "./game.type";
export declare class GameInstance {
    lobby: Lobby;
    private gameData;
    private settings;
    constructor(lobby: Lobby);
    handleGoal(nextPos: any): void;
    checkGoals(nextPos: any): boolean;
    ballHitsLeftPaddle(nextPos: {
        x: number;
        y: number;
    }): boolean;
    ballHitsRightPaddle(nextPos: {
        x: number;
        y: number;
    }): boolean;
    ballHitsTopOrBottom(nextPos: {
        x: number;
        y: number;
    }): boolean;
    gameLoop(): void;
    getDelta(speed: number, radian: number): {
        x: number;
        y: number;
    };
    updateBall(x: number, y: number, radian: number): void;
    resetRound(): void;
    resetPaddle(): void;
    stop(): void;
    addPlayer(clientId: string): void;
    sendReady(): void;
    isPlayer(clientId: string): boolean;
    getPlayer(playerId: string): Player;
    getPlayers(): Player[];
    playersId(): string[];
}
