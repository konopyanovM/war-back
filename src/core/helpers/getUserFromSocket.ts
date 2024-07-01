import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../features/auth/types';

export const getUserFromSocket = (
  client: Socket,
  jwtService: JwtService,
  configService: ConfigService,
): JwtPayload => {
  const authHeader = client.handshake.headers.authorization;

  return jwtService.verify(authHeader.split(' ')[1], {
    secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
  });
};
