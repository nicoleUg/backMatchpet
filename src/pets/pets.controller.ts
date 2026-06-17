import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { QueryPetsDto } from './dto/query-pets.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUserDecorator } from '../common/decorators/current-user.decorator';
import type { CurrentUser } from '../common/interfaces/current-user.interface';
import { MatchesService } from '../matches/matches.service';
import { AdoptionsService } from '../adoptions/adoptions.service';

@ApiTags('pets')
@Controller('pets')
export class PetsController {
	constructor(
		private readonly petsService: PetsService,
		private readonly matchesService: MatchesService,
		private readonly adoptionsService: AdoptionsService,
	) {}

	@ApiBearerAuth()
	@UseGuards(FirebaseAuthGuard)
	@Post()
	create(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreatePetDto) {
		return this.petsService.create(user.uid, dto);
	}

	@Get()
	findAll(@Query() query: QueryPetsDto) {
		return this.petsService.findAll(query);
	}

	@ApiBearerAuth()
	@UseGuards(FirebaseAuthGuard)
	@Post(':id/like')
	like(@CurrentUserDecorator() user: CurrentUser, @Param('id') petId: string) {
		return this.matchesService.likePet(user.uid, petId);
	}

	@ApiBearerAuth()
	@UseGuards(FirebaseAuthGuard)
	@Post(':id/adopt')
	adopt(@CurrentUserDecorator() user: CurrentUser, @Param('id') petId: string) {
		return this.adoptionsService.adoptPet(user.uid, petId);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.petsService.findOne(id);
	}

	@ApiBearerAuth()
	@UseGuards(FirebaseAuthGuard)
	@Patch(':id')
	update(
		@CurrentUserDecorator() user: CurrentUser,
		@Param('id') id: string,
		@Body() dto: UpdatePetDto,
	) {
		return this.petsService.update(user.uid, id, dto);
	}

	@ApiBearerAuth()
	@UseGuards(FirebaseAuthGuard)
	@Delete(':id')
	remove(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string) {
		return this.petsService.remove(user.uid, id);
	}
}
