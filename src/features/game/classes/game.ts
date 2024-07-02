import { Player } from './player';
import { GameParameters } from '../types';

export class Game {
  id: string;

  westPlayer: Player;
  eastPlayer: Player;

  constructor({ id, westPlayer, eastPlayer }: GameParameters) {
    this.id = id;
    this.westPlayer = westPlayer;
    this.eastPlayer = eastPlayer;
  }
}
