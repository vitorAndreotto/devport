import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { User } from '../users/user.entity.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/dev')
  @HttpCode(HttpStatus.CREATED)
  async registerDev(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto, UserRole.Dev);
    return { data: result };
  }

  @Post('register/company')
  @HttpCode(HttpStatus.CREATED)
  async registerCompany(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto, UserRole.Company);
    return { data: result };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return { data: result };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: User & { currentRefreshToken: string },
    @Body() _dto: RefreshTokenDto,
  ) {
    const result = await this.authService.refresh(user);
    return { data: result };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: User) {
    await this.authService.logout(user.id);
    return { message: 'Logout realizado com sucesso.' };
  }
}
