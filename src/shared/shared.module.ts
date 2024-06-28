import { Global, Module } from '@nestjs/common';
import { HashService } from '../core/services/hash/hash.service';

@Global()
@Module({
  providers: [HashService],
  exports: [HashService],
})
export class SharedModule {}
