import { Team } from '../../../core/types';
import { PlayerParameters } from '../types';

export class Player {
  public id: number;
  public clientId: string;
  public username: string;

  public gold: number = 500;

  public team: Team;

  constructor({ id, clientId, username }: PlayerParameters) {
    this.id = id;
    this.clientId = clientId;
    this.username = username;
  }
}
