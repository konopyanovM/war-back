import { GameActionType, MatchmakingStatus } from './enums';
import { Team } from '../../../core/types';

export interface MatchmakingPayload {
  userId: number;
  elo: number;
  status: MatchmakingStatus;
}

export interface GameActionPayload {
  gameId: string;
  type: GameActionType;
  team?: Team;
  data: any;
}

export interface GameStatePayload {
  gameId: string;
  team: Team;
}
