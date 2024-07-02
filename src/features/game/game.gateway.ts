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
import { GameService } from './game.service';
import { Game, Player } from './classes';
import { GameSession } from '@prisma/client';
import {
  GameActionPayload,
  GameStatePayload,
  MatchmakingPayload,
  MatchmakingStatus,
} from './types';

@WebSocketGateway({ cors: true })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private _jwtService: JwtService,
    private _configService: ConfigService,
    private _websocketService: GameService,
  ) {}

  @WebSocketServer()
  private _server: Server;

  private _matchmakingQueue = new Map<string, Player>();
  private _sockets = new Map<string, Socket>();
  private _games = new Map<string, Game>();

  @SubscribeMessage('matchmaking')
  public async matchmaking(client: Socket, payload: MatchmakingPayload) {
    const user = this._getUserFromSocket(client);
    const player: Player = new Player({
      id: user.sub,
      clientId: client.id,
      username: user.username,
    });

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
    const game = this._games.get(payload.gameId);
    const user = this._getUserFromSocket(client);

    if (game) {
      const team = game.westPlayer.id === user.sub ? Team.West : Team.East;
      this._server.to(game.id).emit('gameActionUpdate', {
        type: payload.type,
        team,
        data: payload.data,
      });
    }
  }

  @SubscribeMessage('gameState')
  gameState(client: Socket, payload: GameStatePayload) {
    const game: Game = this._games.get(payload.gameId);
    if (payload.team === Team.West) {
      this._websocketService
        .updateGameSession(payload.gameId, payload.team)
        .then(() => {
          this._server.to(game.id).emit('gameStateUpdate', game);
        });
    } else if (payload.team === Team.East) {
      this._websocketService
        .updateGameSession(payload.gameId, payload.team)
        .then(() => {
          this._server.to(game.id).emit('gameStateUpdate', game);
        });
    }
  }

  // Private methods

  private matchPlayers() {
    if (this._matchmakingQueue.size >= 2) {
      const keys = this._matchmakingQueue.keys();

      const firstKey = keys.next().value;
      const secondKey = keys.next().value;

      const westPlayer: Player = this._matchmakingQueue.get(firstKey);
      const eastPlayer: Player = this._matchmakingQueue.get(secondKey);

      westPlayer.team = Team.West;
      eastPlayer.team = Team.East;

      this._server
        .to(westPlayer.clientId)
        .emit('matchmakingUpdate', { status: MatchmakingStatus.Found });
      this._server
        .to(eastPlayer.clientId)
        .emit('matchmakingUpdate', { status: MatchmakingStatus.Found });

      this._websocketService
        .createGameSession(westPlayer.id, eastPlayer.id)
        .then((gameSession: GameSession) => {
          this._matchmakingQueue.delete(firstKey);
          this._matchmakingQueue.delete(secondKey);

          this._sockets.get(westPlayer.clientId).join(gameSession.id);
          this._sockets.get(eastPlayer.clientId).join(gameSession.id);

          const game = new Game({
            id: gameSession.id,
            westPlayer: westPlayer,
            eastPlayer: eastPlayer,
          });

          this._games.set(gameSession.id, game);
          this._server.to(gameSession.id).emit('gameStateUpdate', game);
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
