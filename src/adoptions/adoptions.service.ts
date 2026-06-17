import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { FieldValue } from 'firebase-admin/firestore';
import { PetsRepository, PetDocument } from '../pets/pets.repository';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { Pet, PetStatus } from '../pets/interfaces/pet.interface';

@Injectable()
export class AdoptionsService {
	constructor(
		private readonly petsRepository: PetsRepository,
		private readonly usersRepository: UsersRepository,
		private readonly usersService: UsersService,
	) {}

	async adoptPet(userId: string, petId: string): Promise<Pet> {
		const userRef = this.usersRepository.getCollectionRef().doc(userId);
		const petRef = this.petsRepository.getCollectionRef().doc(petId);

		await this.usersRepository.getCollectionRef().firestore.runTransaction(async (transaction) => {
			const [userSnapshot, petSnapshot] = await Promise.all([
				transaction.get(userRef),
				transaction.get(petRef),
			]);

			if (!userSnapshot.exists) {
				throw new NotFoundException('User not found');
			}

			if (!petSnapshot.exists) {
				throw new NotFoundException('Pet not found');
			}

			const pet = petSnapshot.data() as PetDocument;
			if (pet.status === PetStatus.ADOPTED) {
				throw new ConflictException('Pet is already adopted');
			}

			const now = new Date().toISOString();

			transaction.update(petRef, {
				status: PetStatus.ADOPTED,
				ownerId: userId,
				updatedAt: now,
			});

			transaction.update(userRef, {
				adoptions: FieldValue.arrayUnion(petId),
				matches: FieldValue.arrayRemove(petId),
				updatedAt: now,
			});
		});

		await this.usersService.removePetFromAllMatches(petId);

		const updatedPet = await this.petsRepository.findById(petId);
		if (!updatedPet) {
			throw new NotFoundException('Pet not found after adoption');
		}

		return updatedPet;
	}

	async listAdoptionsForUser(userId: string): Promise<Pet[]> {
		const user = await this.usersRepository.findById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const ids = user.adoptions ?? [];
		if (ids.length === 0) {
			return [];
		}

		const pets = await Promise.all(
			ids.map((petId) => this.petsRepository.findById(petId)),
		);

		return pets.filter((pet): pet is Pet => pet !== null);
	}
}
