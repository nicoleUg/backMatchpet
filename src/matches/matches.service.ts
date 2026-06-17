import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { FieldValue } from 'firebase-admin/firestore';
import { PetsRepository } from '../pets/pets.repository';
import { UsersRepository } from '../users/users.repository';
import { Pet, PetStatus } from '../pets/interfaces/pet.interface';

@Injectable()
export class MatchesService {
	constructor(
		private readonly petsRepository: PetsRepository,
		private readonly usersRepository: UsersRepository,
	) {}

	async likePet(userId: string, petId: string) {
		const [user, pet] = await Promise.all([
			this.usersRepository.findById(userId),
			this.petsRepository.findById(petId),
		]);

		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (!pet) {
			throw new NotFoundException('Pet not found');
		}

		if (pet.status === PetStatus.ADOPTED) {
			throw new ConflictException('Adopted pets cannot be liked');
		}

		const currentMatches = user.matches ?? [];
		if (!currentMatches.includes(petId)) {
			const userRef = this.usersRepository.getCollectionRef().doc(userId);
			await userRef.update({
				matches: FieldValue.arrayUnion(petId),
				updatedAt: new Date().toISOString(),
			});
		}

		const updatedUser = await this.usersRepository.findById(userId);
		const updatedMatches = updatedUser?.matches ?? [];

		return {
			success: true,
			petId,
			matches: updatedMatches,
			matchesCount: updatedMatches.length,
		};
	}

	async listMatchesForUser(userId: string): Promise<Pet[]> {
		const user = await this.usersRepository.findById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const ids = user.matches ?? [];
		if (ids.length === 0) {
			return [];
		}

		const pets = await Promise.all(
			ids.map((petId) => this.petsRepository.findById(petId)),
		);

		return pets
			.filter((pet): pet is Pet => pet !== null)
			.filter((pet) => pet.status !== PetStatus.ADOPTED);
	}
}
