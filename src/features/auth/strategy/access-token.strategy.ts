import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { User } from '@prisma/client';
import { JwtPayload } from '../types';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    _config: ConfigService,
    private _prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: _config.get('ACCESS_TOKEN_SECRET'),
    });
  }

  public async validate(payload: JwtPayload): Promise<User> {
    const user = await this._prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (user === null) throw new NotFoundException('User does not exist');

    delete user.hashedPassword;
    return user;
  }
}
