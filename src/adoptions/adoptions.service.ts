import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { FirebaseService } from '../firebase/firebase/firebase.service';
import { Pet, PetStatus } from '../pets/interfaces/pet.interface';
import { UsersService } from '../users/users.service';

interface PetDocument {
	name: string;
	species: string;
	gender: string;
	age: number;
	breed: string;
	personality: string;
	status: string;
	ownerId: string;
	photoUrl: string | null;
	createdAt: Timestamp | string;
	updatedAt: Timestamp | string;
}

interface UserDocument {
	adoptions: string[];
}

@Injectable()
export class AdoptionsService {
	constructor(
		private readonly firebaseService: FirebaseService,
		private readonly usersService: UsersService,
	) {}

	async adoptPet(userId: string, petId: string): Promise<Pet> {
		const userRef = this.firebaseService.firestore.collection('users').doc(userId);
		const petRef = this.firebaseService.firestore.collection('pets').doc(petId);

		await this.firebaseService.firestore.runTransaction(async (transaction) => {
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

		const updatedPet = await petRef.get();
		if (!updatedPet.exists) {
			throw new NotFoundException('Pet not found after adoption');
		}

		return this.mapPet(updatedPet.id, updatedPet.data() as PetDocument);
	}

	async listAdoptionsForUser(userId: string): Promise<Pet[]> {
		const userSnapshot = await this.firebaseService.firestore
			.collection('users')
			.doc(userId)
			.get();

		if (!userSnapshot.exists) {
			throw new NotFoundException('User not found');
		}

		const ids = (userSnapshot.data() as UserDocument).adoptions ?? [];
		if (ids.length === 0) {
			return [];
		}

		const petSnapshots = await Promise.all(
			ids.map((petId) => this.firebaseService.firestore.collection('pets').doc(petId).get()),
		);

		return petSnapshots
			.filter((doc) => doc.exists)
			.map((doc) => this.mapPet(doc.id, doc.data() as PetDocument));
	}

	private mapPet(id: string, data: PetDocument): Pet {
		return {
			id,
			name: data.name,
			species: data.species,
			gender: data.gender,
			age: data.age,
			breed: data.breed,
			personality: data.personality,
			status: data.status as PetStatus,
			ownerId: data.ownerId,
			photoUrl: data.photoUrl ?? null,
			createdAt: this.firebaseService.toIsoString(data.createdAt),
			updatedAt: this.firebaseService.toIsoString(data.updatedAt),
		};
	}
}
