import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PetsRepository } from './pets.repository';
import { CreatePetDto } from './dto/create-pet.dto';
import { QueryPetsDto } from './dto/query-pets.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet } from './interfaces/pet.interface';

@Injectable()
export class PetsService {
	constructor(private readonly petsRepository: PetsRepository) {}

	async create(ownerId: string, dto: CreatePetDto): Promise<Pet> {
		return this.petsRepository.create(ownerId, dto);
	}

	async findAll(query: QueryPetsDto): Promise<Pet[]> {
		return this.petsRepository.findAll(query);
	}

	async findOne(id: string): Promise<Pet> {
		const pet = await this.petsRepository.findById(id);
		if (!pet) {
			throw new NotFoundException('Pet not found');
		}
		return pet;
	}

	async update(ownerId: string, petId: string, dto: UpdatePetDto): Promise<Pet> {
		const pet = await this.petsRepository.findById(petId);
		if (!pet) {
			throw new NotFoundException('Pet not found');
		}

		if (pet.ownerId !== ownerId) {
			throw new ForbiddenException('You can only edit your own pets');
		}

		return this.petsRepository.update(petId, dto);
	}

	async remove(ownerId: string, petId: string) {
		const pet = await this.petsRepository.findById(petId);
		if (!pet) {
			throw new NotFoundException('Pet not found');
		}

		if (pet.ownerId !== ownerId) {
			throw new ForbiddenException('You can only delete your own pets');
		}

		await this.petsRepository.remove(petId);
		return {
			success: true,
			deletedId: petId,
		};
	}
}
