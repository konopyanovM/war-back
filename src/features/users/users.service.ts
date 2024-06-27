import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly _prismaService: PrismaService) {}

  public async getAllUsers() {
    let users: User[] = [];

    try {
      users = await this._prismaService.user.findMany();

      return users;
    } catch (error) {}
  }
}
