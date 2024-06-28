import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { JwtPayload, UserWithRefreshToken } from '../types';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    _config: ConfigService,
    private _prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: _config.get('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  public async validate(
    req: Request,
    payload: JwtPayload,
  ): Promise<UserWithRefreshToken> {
    const user = await this._prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    delete user.hashedPassword;

    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();

    return {
      ...user,
      refreshToken,
    };
  }
}
