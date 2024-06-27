import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly _prismaService: PrismaService) {}

  public async updateUser(userId: number, data: Partial<User>) {
    try {
      return await this._prismaService.user.update({
        where: {
          id: userId,
        },
        data,
      });
    } catch (error) {}
  }
}
