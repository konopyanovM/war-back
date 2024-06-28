import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { RelationshipEnum, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

  // Relations
  public async getRelations(userId: number, type?: RelationshipEnum) {
    try {
      return await this._prismaService.relationship.findMany({
        where: {
          userId,
          type,
        },
        include: {
          relatedUser: true,
        },
      });
    } catch (error) {}
  }

  public async getRelatedRelations(userId: number, type?: RelationshipEnum) {
    try {
      return await this._prismaService.relationship.findMany({
        where: {
          relatedUserId: userId,
          type,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {}
  }

  public async createRelation(
    userId: number,
    relatedUserId: number,
    type: RelationshipEnum,
  ) {
    if (userId === relatedUserId)
      throw new BadRequestException('User cannot be in relation with himself');

    try {
      return await this._prismaService.relationship.create({
        data: {
          userId,
          relatedUserId,
          type,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('This relationship already exists');
        }
      }

      throw error;
    }
  }

  public async updateRelation(
    userId: number,
    relatedUserId: number,
    type: RelationshipEnum,
  ) {
    try {
      return await this._prismaService.relationship.update({
        where: {
          userId_relatedUserId: {
            userId,
            relatedUserId,
          },
        },
        data: {
          type,
        },
      });
    } catch (error) {}
  }

  public async deleteRelation(userId: number, relatedUserId: number) {
    try {
      return await this._prismaService.relationship.delete({
        where: {
          userId_relatedUserId: {
            userId,
            relatedUserId,
          },
        },
      });
    } catch (error) {}
  }
}
