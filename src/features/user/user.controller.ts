import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { GetUser } from 'src/features/auth/decorator';
import { UserService } from './user.service';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private _userService: UserService) {}

  @Get('')
  public getCurrentUser(@GetUser() user: User) {
    return user;
  }

  @Patch('')
  public updateUser(@GetUser() user: User, @Body() data: User) {
    return this._userService.updateUser(user.id, data);
  }
}
