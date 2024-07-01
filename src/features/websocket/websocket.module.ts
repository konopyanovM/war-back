import { Module } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { WebsocketGateway } from './websocket.gateway';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [WebsocketService, WebsocketGateway],
})
export class WebsocketModule {}
