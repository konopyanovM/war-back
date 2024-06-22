import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  @Get('current')
  public getCurrentUser(@GetUser() user: User) {
    return user;
  }
}
