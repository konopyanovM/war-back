import { User } from '@prisma/client';

export interface Jwt {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
}

export interface UserWithRefreshToken extends User, Pick<Jwt, 'refreshToken'> {}
