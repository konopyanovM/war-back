import { Controller, Get } from '@nestjs/common';
import { entityParameters } from './constants/entity-parameters';
import { Entity, EntityParameters } from './types';

@Controller('game')
export class GameController {
  @Get('entity-parameters')
  public getEntityParameters(): Record<Entity, EntityParameters> {
    return entityParameters;
  }
}
