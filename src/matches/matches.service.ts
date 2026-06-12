import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { FirebaseService } from '../firebase/firebase/firebase.service';
import { Pet, PetStatus } from '../pets/interfaces/pet.interface';

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
	matches: string[];
}

@Injectable()
export class MatchesService {
	constructor(private readonly firebaseService: FirebaseService) {}

	async likePet(userId: string, petId: string) {
		const userRef = this.firebaseService.firestore.collection('users').doc(userId);
		const petRef = this.firebaseService.firestore.collection('pets').doc(petId);

		const [userSnapshot, petSnapshot] = await Promise.all([userRef.get(), petRef.get()]);

		if (!userSnapshot.exists) {
			throw new NotFoundException('User not found');
		}

		if (!petSnapshot.exists) {
			throw new NotFoundException('Pet not found');
		}

		const petData = petSnapshot.data() as PetDocument;
		if (petData.status === PetStatus.ADOPTED) {
			throw new ConflictException('Adopted pets cannot be liked');
		}

		const userData = userSnapshot.data() as UserDocument;
		const currentMatches = userData.matches ?? [];

		if (!currentMatches.includes(petId)) {
			await userRef.update({
				matches: FieldValue.arrayUnion(petId),
				updatedAt: new Date().toISOString(),
			});
		}

		const updatedUser = await userRef.get();
		const updatedMatches = (updatedUser.data() as UserDocument).matches ?? [];

		return {
			success: true,
			petId,
			matches: updatedMatches,
			matchesCount: updatedMatches.length,
		};
	}

	async listMatchesForUser(userId: string): Promise<Pet[]> {
		const userSnapshot = await this.firebaseService.firestore
			.collection('users')
			.doc(userId)
			.get();

		if (!userSnapshot.exists) {
			throw new NotFoundException('User not found');
		}

		const ids = (userSnapshot.data() as UserDocument).matches ?? [];
		if (ids.length === 0) {
			return [];
		}

		const petSnapshots = await Promise.all(
			ids.map((petId) => this.firebaseService.firestore.collection('pets').doc(petId).get()),
		);

		return petSnapshots
			.filter((doc) => doc.exists)
			.map((doc) => this.mapPet(doc.id, doc.data() as PetDocument))
			.filter((pet) => pet.status !== PetStatus.ADOPTED);
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
