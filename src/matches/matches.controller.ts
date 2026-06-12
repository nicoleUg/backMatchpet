import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUserDecorator } from '../common/decorators/current-user.decorator';
import type { CurrentUser } from '../common/interfaces/current-user.interface';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
	constructor(private readonly matchesService: MatchesService) {}

	@ApiBearerAuth()
	@UseGuards(FirebaseAuthGuard)
	@Get('me')
	getMyMatches(@CurrentUserDecorator() user: CurrentUser) {
		return this.matchesService.listMatchesForUser(user.uid);
	}
}
