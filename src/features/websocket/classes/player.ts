export class Player {
  public id: number;
  public clientId: string;
  public username: string;

  public gold: number = 500;

  constructor(id: number, clientId: string, username: string) {
    this.id = id;
    this.clientId = clientId;
    this.username = username;
  }
}
