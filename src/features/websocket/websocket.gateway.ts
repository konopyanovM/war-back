import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { getUserFromSocket } from '../../core/helpers';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Team } from '../../core/types';
import { WebsocketService } from './websocket.service';
import { Player } from './classes';
import { GameSession } from '@prisma/client';
import {
  GameActionPayload,
  GameStatePayload,
  MatchmakingPayload,
  MatchmakingStatus,
} from './types';

@WebSocketGateway({ cors: true })
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private _jwtService: JwtService,
    private _configService: ConfigService,
    private _websocketService: WebsocketService,
  ) {}

  @WebSocketServer()
  private _server: Server;

  private _matchmakingQueue = new Map<string, Player>();
  private _sockets = new Map<string, Socket>();
  private _games = new Map<string, GameSession>();

  @SubscribeMessage('matchmaking')
  public async matchmaking(client: Socket, payload: MatchmakingPayload) {
    const user = this._getUserFromSocket(client);
    const player: Player = new Player(user.sub, client.id, user.username);

    switch (payload.status) {
      case MatchmakingStatus.Joined:
        if (this._matchmakingQueue.has(client.id)) return;

        // Add player to matchmaking queue
        this._matchmakingQueue.set(client.id, player);
        this._sockets.set(client.id, client);

        // Notify the client and try to match players
        client.emit('matchmakingUpdate', { status: MatchmakingStatus.Joined });
        this.matchPlayers();
        break;

      case MatchmakingStatus.Cancelled:
        if (!this._matchmakingQueue.has(client.id)) return;

        // Remove player from matchmaking queue
        this._matchmakingQueue.delete(client.id);
        this._sockets.delete(client.id);

        // Notify the client
        client.emit('matchmakingUpdate', {
          status: MatchmakingStatus.Cancelled,
        });
    }
  }

  @SubscribeMessage('gameAction')
  gameAction(client: Socket, payload: GameActionPayload) {
    const gameSession = this._games.get(payload.gameId);
    const user = this._getUserFromSocket(client);

    if (gameSession) {
      const team =
        gameSession.westPlayerId === user.sub ? Team.West : Team.East;
      this._server.to(gameSession.id).emit('gameActionUpdate', {
        type: payload.type,
        team,
        data: payload.data,
      });
    }
  }

  @SubscribeMessage('gameState')
  gameState(client: Socket, payload: GameStatePayload) {
    const gameSession: GameSession = this._games.get(payload.gameId);
    if (payload.team === Team.West) {
      this._websocketService
        .updateGameSession(payload.gameId, payload.team)
        .then(() => {
          this._server.to(gameSession.id).emit('gameStateUpdate', gameSession);
        });
    } else if (payload.team === Team.East) {
      this._websocketService
        .updateGameSession(payload.gameId, payload.team)
        .then(() => {
          this._server.to(gameSession.id).emit('gameStateUpdate', gameSession);
        });
    }
  }

  // Private methods

  private matchPlayers() {
    if (this._matchmakingQueue.size >= 2) {
      const keys = this._matchmakingQueue.keys();

      const firstKey = keys.next().value;
      const secondKey = keys.next().value;

      const player1: Player = this._matchmakingQueue.get(firstKey);
      const player2: Player = this._matchmakingQueue.get(secondKey);

      this._server
        .to(player1.clientId)
        .emit('matchmakingUpdate', { status: MatchmakingStatus.Found });
      this._server
        .to(player2.clientId)
        .emit('matchmakingUpdate', { status: MatchmakingStatus.Found });

      this._websocketService
        .createGameSession(player1.id, player2.id)
        .then((gameSession: GameSession) => {
          this._matchmakingQueue.delete(firstKey);
          this._matchmakingQueue.delete(secondKey);

          this._sockets.get(player1.clientId).join(gameSession.id);
          this._sockets.get(player2.clientId).join(gameSession.id);

          this._games.set(gameSession.id, gameSession);
          this._server.to(gameSession.id).emit('gameStateUpdate', gameSession);
        });
    }
  }

  private _getUserFromSocket(client: Socket) {
    return getUserFromSocket(client, this._jwtService, this._configService);
  }

  // Lifecycle

  afterInit() {}

  handleConnection(client: Socket) {
    // Handle new connection
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    // Handle disconnection
    console.log('Client disconnected:', client.id);
    // Handle removing from matchmaking queue and active games if necessary
    this._matchmakingQueue.delete(client.id);
  }
}
