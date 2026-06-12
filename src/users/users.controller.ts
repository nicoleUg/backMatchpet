import {
	Controller,
	Get,
	Param,
	Patch,
	Body,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUserDecorator } from '../common/decorators/current-user.decorator';
import type { CurrentUser } from '../common/interfaces/current-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get(':id')
	getById(@Param('id') id: string) {
		return this.usersService.getById(id);
	}

	@Get(':id/profile')
	getProfile(@Param('id') id: string) {
		return this.usersService.getProfile(id);
	}

	@Get(':id/matches')
	getMatches(@Param('id') id: string) {
		return this.usersService.getMatches(id);
	}

	@Get(':id/adoptions')
	getAdoptions(@Param('id') id: string) {
		return this.usersService.getAdoptions(id);
	}

	@ApiBearerAuth()
	@UseGuards(FirebaseAuthGuard)
	@Patch('me')
	patchMe(
		@CurrentUserDecorator() user: CurrentUser,
		@Body() dto: UpdateUserDto,
	) {
		return this.usersService.updateMe(user.uid, dto);
	}
}
