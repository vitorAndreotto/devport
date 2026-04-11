import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { SkipTransform } from '../common/decorators/skip-transform.decorator.js';
import { User } from '../users/user.entity.js';

@Controller('auth')
@UseGuards(ThrottlerGuard)
@Throttle({ auth: { ttl: 60000, limit: 10 } })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/dev')
  @HttpCode(HttpStatus.CREATED)
  async registerDev(@Body() dto: RegisterDto) {
    return this.authService.register(dto, UserRole.Dev);
  }

  @Post('register/company')
  @HttpCode(HttpStatus.CREATED)
  async registerCompany(@Body() dto: RegisterDto) {
    return this.authService.register(dto, UserRole.Company);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: User & { currentRefreshToken: string },
    @Body() _dto: RefreshTokenDto,
  ) {
    return this.authService.refresh(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @SkipTransform()
  async logout(@CurrentUser() user: User) {
    await this.authService.logout(user.id);
    return { message: 'Logout realizado com sucesso.' };
  }
}
