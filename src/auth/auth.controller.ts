import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto } from './dto/auth.dto';
import { Jwt, UserWithRefreshToken } from './types';
import { GetUser, Public } from './decorator';
import { RefreshGuard } from './guards/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private _authService: AuthService) {}

  @Public()
  @Post('sign-up')
  public signUp(@Body() dto: SignUpDto): Promise<Jwt> {
    return this._authService.signUp(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public login(@Body() dto: LoginDto): Promise<Jwt> {
    return this._authService.login(dto);
  }

  @Public()
  @UseGuards(RefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public refresh(@GetUser() user: UserWithRefreshToken) {
    return this._authService.refresh(user.id, user.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public logout(@GetUser('id') userId: number) {
    return this._authService.logout(userId);
  }
}
