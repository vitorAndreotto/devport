import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { JwtPayload } from '../common/types/jwt-payload.type.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { User } from '../users/user.entity.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto, role: UserRole) {
    if (dto.password !== dto.password_confirmation) {
      throw new BadRequestException('As senhas não coincidem.');
    }

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(dto.name, dto.email, passwordHash, role);

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, await bcrypt.hash(tokens.refresh_token, 10));

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, await bcrypt.hash(tokens.refresh_token, 10));

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refresh(user: User & { currentRefreshToken: string }) {
    const isValid = await bcrypt.compare(user.currentRefreshToken, user.refreshToken!);

    if (!isValid) {
      await this.usersService.updateRefreshToken(user.id, null);
      throw new UnauthorizedException('Refresh token inválido.');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, await bcrypt.hash(tokens.refresh_token, 10));

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const tokenPayload = { ...payload } as Record<string, unknown>;

    const accessExpiresIn = this.config.get<string>('JWT_EXPIRES_IN', '15m');
    const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(tokenPayload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: accessExpiresIn as any,
      }),
      this.jwtService.signAsync(tokenPayload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn as any,
      }),
    ]);

    return { access_token, refresh_token };
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.createdAt,
    };
  }
}
