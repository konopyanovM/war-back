import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { UserModule } from '../user/user.module';
import { GameController } from './game.controller';

@Module({
  imports: [UserModule],
  controllers: [GameController],
  providers: [GameService, GameGateway],
})
export class GameModule {}
