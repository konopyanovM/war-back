import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HashService } from 'src/common/services/hash.service';
import { Jwt, JwtPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private _prismaService: PrismaService,
    private _jwtService: JwtService,
    private _configService: ConfigService,
    private _hashService: HashService,
  ) {}

  // Public methods

  public async signUp(dto: AuthDto): Promise<Jwt> {
    // Generate the password hash
    const hashedPassword = await this._hashService.get(dto.password);

    // Save the user in the db
    try {
      const user = await this._prismaService.user.create({
        data: {
          email: dto.email,
          hashedPassword,
        },
      });

      // Return JWT
      return this._getTokens(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  public async login(dto: AuthDto): Promise<Jwt> {
    // Find the user by email
    try {
      const user = await this._prismaService.user.findUniqueOrThrow({
        where: {
          email: dto.email,
        },
      });
      // Compare passwords
      const passwordMatches = await this._hashService.verify(
        user.hashedPassword,
        dto.password,
      );

      // If password incorrect throw exception
      if (!passwordMatches) {
        throw new ForbiddenException('Credentials incorrect');
      }

      return this._getTokens(user.id, user.email);
    } catch (error) {
      // If the user does not exist throws an exception
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ForbiddenException(error.message);
        }
      }
      throw error;
    }
  }

  public async refresh(userId: number, refreshToken: string) {
    let user;

    try {
      user = await this._prismaService.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      });
      if (!user || !user.hashedRefreshToken)
        throw new ForbiddenException(
          'User is not exits or refresh token is missing',
        );

      const refreshTokenMatches = this._hashService.verify(
        user.hashedRefreshToken,
        refreshToken,
      );

      if (!refreshTokenMatches) {
        throw new ForbiddenException('Refresh token is incorrect');
      }

      return this._getTokens(user.id, user.email);
    } catch (error) {
      // If the user does not exist throws an exception
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ForbiddenException(error.message);
        }
      }
      throw error;
    }
  }

  public async logout(userId: number) {
    await this._prismaService.user.update({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: {
        hashedRefreshToken: null,
      },
    });
  }

  // Private methods

  private async _updateRefreshToken(userId: number, refreshToken: string) {
    // Hash refresh token
    const hashedRefreshToken = await this._hashService.get(refreshToken);

    // Update refresh token at database
    await this._prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken,
      },
    });
  }

  private async _getTokens(userId: number, email: string): Promise<Jwt> {
    const payload: JwtPayload = {
      sub: userId,
      email,
    };

    const accessToken = await this._getAccessToken(payload);
    const refreshToken = await this._getRefreshToken(payload);

    await this._updateRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async _getAccessToken(payload: JwtPayload) {
    const secret = this._configService.get('ACCESS_TOKEN_SECRET');

    return await this._jwtService.signAsync(payload, {
      expiresIn: '60m',
      secret,
    });
  }

  private async _getRefreshToken(payload: JwtPayload) {
    const secret = this._configService.get('REFRESH_TOKEN_SECRET');

    return await this._jwtService.signAsync(payload, {
      expiresIn: '7w',
      secret,
    });
  }
}
