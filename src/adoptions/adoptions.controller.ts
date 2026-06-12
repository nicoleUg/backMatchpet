import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdoptionsService } from './adoptions.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUserDecorator } from '../common/decorators/current-user.decorator';
import type { CurrentUser } from '../common/interfaces/current-user.interface';

@ApiTags('adoptions')
@Controller('adoptions')
export class AdoptionsController {
	constructor(private readonly adoptionsService: AdoptionsService) {}

	@ApiBearerAuth()
	@UseGuards(FirebaseAuthGuard)
	@Get('me')
	getMyAdoptions(@CurrentUserDecorator() user: CurrentUser) {
		return this.adoptionsService.listAdoptionsForUser(user.uid);
	}
}
