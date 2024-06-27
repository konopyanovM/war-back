import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HashService } from 'src/shared/services/hash.service';
import { Jwt, JwtPayload } from './types';
import { LoginDto, SignUpDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private _prismaService: PrismaService,
    private _jwtService: JwtService,
    private _configService: ConfigService,
    private _hashService: HashService,
  ) {}

  // Public methods

  public async signUp(dto: SignUpDto): Promise<Jwt> {
    // Generate the password hash
    const hashedPassword = await this._hashService.get(dto.password);

    // Save the user in the db
    try {
      const user: User = await this._prismaService.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          hashedPassword,
        },
      });

      // Return JWT
      return this._getTokens({
        email: user.email,
        sub: user.id,
        username: user.username,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException('Credentials taken');
      }
      throw error;
    }
  }

  public async login(dto: LoginDto): Promise<Jwt> {
    // Find the user by email
    try {
      const user = await this._prismaService.user.findUniqueOrThrow({
        where: {
          username: dto.username,
        },
      });
      // Compare passwords
      const passwordMatches = await this._hashService.verify(
        user.hashedPassword,
        dto.password,
      );

      // If password incorrect throw exception
      if (!passwordMatches) {
        throw new UnauthorizedException('Credentials incorrect');
      }

      return this._getTokens({
        email: user.email,
        sub: user.id,
        username: user.username,
      });
    } catch (error) {
      // If the user does not exist throws an exception
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new UnauthorizedException(error.message);
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
        throw new NotFoundException(
          'User is not exits or refresh token is missing',
        );

      const refreshTokenMatches = this._hashService.verify(
        user.hashedRefreshToken,
        refreshToken,
      );

      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Refresh token is incorrect');
      }

      return this._getTokens(user);
    } catch (error) {
      // If the user does not exist throws an exception
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(error.message);
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

  private async _getTokens(payload: JwtPayload): Promise<Jwt> {
    const accessToken = await this._getAccessToken(payload);
    const refreshToken = await this._getRefreshToken(payload);

    await this._updateRefreshToken(payload.sub, refreshToken);

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
