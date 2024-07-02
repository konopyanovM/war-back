import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/services/prisma/prisma.service';
import { Team } from '../../core/types';

@Injectable()
export class GameService {
  constructor(private _prismaService: PrismaService) {}

  // Game session
  public async createGameSession(westPlayerId: number, eastPlayerId: number) {
    try {
      return await this._prismaService.gameSession.create({
        data: {
          westPlayerId: westPlayerId,
          eastPlayerId: eastPlayerId,
        },
      });
    } catch (error) {}
  }

  public async updateGameSession(id: string, winnerTeam: Team) {
    try {
      return await this._prismaService.gameSession.update({
        where: {
          id,
        },
        data: {
          winnerTeam,
        },
      });
    } catch (error) {}
  }

  public async getGameSession(id: string) {
    try {
      return await this._prismaService.gameSession.findUniqueOrThrow({
        where: {
          id,
        },
      });
    } catch (error) {}
  }
}
