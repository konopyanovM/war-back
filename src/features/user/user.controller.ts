import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RelationshipEnum, User } from '@prisma/client';
import { GetUser } from 'src/features/auth/decorator';
import { UserService } from './user.service';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private _userService: UserService) {}

  @Get('')
  public getCurrentUser(@GetUser() user: User) {
    return this._userService.getUser(user.id);
  }

  @Patch('')
  public updateUser(@GetUser() user: User, @Body() data: User) {
    return this._userService.updateUser(user.id, data);
  }

  // Relations
  @Get('friends')
  public getFriendList(@GetUser() user: User) {
    return this._userService.getRelations(user.id, RelationshipEnum.FRIEND);
  }

  @Get('pending-friend-requests')
  public getFriendRequests(@GetUser() user: User) {
    return this._userService.getRelatedRelations(
      user.id,
      RelationshipEnum.PENDING,
    );
  }

  @Post('send-friend-request/:id')
  public sendFriendRequest(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) relatedUserId: number,
  ) {
    return this._userService.createRelation(
      user.id,
      relatedUserId,
      RelationshipEnum.PENDING,
    );
  }

  @Post('accept-friend-request/:id')
  public acceptFriendRequest(
    @GetUser() user: User,
    @Param('id') relatedUserId: number,
  ) {
    return this._userService.updateRelation(
      user.id,
      relatedUserId,
      RelationshipEnum.FRIEND,
    );
  }

  @Post('reject-friend-request/:id')
  public rejectFriendRequest(
    @GetUser() user: User,
    @Param('id') relatedUserId: number,
  ) {
    return this._userService.deleteRelation(user.id, relatedUserId);
  }
}
