import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { CurrentUserDecorator } from '../common/decorators/current-user.decorator';
import type { CurrentUser } from '../common/interfaces/current-user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Post('login')
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	@ApiBearerAuth()
	@UseGuards(FirebaseAuthGuard)
	@Get('me')
	me(@CurrentUserDecorator() user: CurrentUser) {
		return this.authService.getMe(user.uid);
	}

	@ApiBearerAuth()
	@UseGuards(FirebaseAuthGuard)
	@Post('logout')
	logout(@CurrentUserDecorator() user: CurrentUser) {
		return this.authService.logout(user.uid);
	}
}
