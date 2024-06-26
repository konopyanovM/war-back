import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { GetUser } from 'src/features/auth/decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  @Get('')
  public getCurrentUser(@GetUser() user: User) {
    return user;
  }
}
