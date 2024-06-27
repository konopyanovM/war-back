import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Get('')
  public getAllUsers() {
    return this._usersService.getAllUsers();
  }
}
