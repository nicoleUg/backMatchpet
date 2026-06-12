import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LegacyRegisterDto } from './dto/legacy-register.dto';
import { LegacyLoginDto } from './dto/legacy-login.dto';

@ApiTags('legacy-auth')
@Controller()
export class LegacyAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: LegacyRegisterDto) {
    return this.authService.register({
      fullName: dto.username,
      displayName: dto.username,
      email: dto.email,
      password: dto.password,
    });
  }

  @Post('login')
  login(@Body() dto: LegacyLoginDto) {
    return this.authService.loginByUsername(dto.username, dto.password);
  }

  @Get('sessions')
  sessions(@Query('limit') limit?: string) {
    return this.authService.getActiveSessions(limit ? Number(limit) : 50);
  }
}
