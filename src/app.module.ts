import { Module } from '@nestjs/common';
import { AuthModule } from './features/auth/auth.module';
import { AccessGuard } from './features/auth/guards';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './core/services/prisma/prisma.module';
import { UserModule } from './features/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './features/users/users.module';
import { GameModule } from './features/game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    SharedModule,
    UsersModule,
    GameModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessGuard,
    },
  ],
})
export class AppModule {}
