import { Injectable, NotFoundException } from '@nestjs/common';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { FirebaseService } from '../firebase/firebase/firebase.service';
import { UserProfile, UserProfileStats } from './interfaces/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { Pet } from '../pets/interfaces/pet.interface';

interface EnsureUserParams {
	uid: string;
	email: string;
	fullName?: string;
	displayName?: string;
}

interface UserDocument {
	fullName: string;
	displayName: string;
	email: string;
	matches: string[];
	adoptions: string[];
	phone: string;
	location: string;
	bio: string;
	createdAt: Timestamp | string;
	updatedAt: Timestamp | string;
}

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

@Injectable()
export class UsersService {
	constructor(private readonly firebaseService: FirebaseService) {}

	async ensureUserDocument(params: EnsureUserParams): Promise<UserProfile> {
		const userRef = this.firebaseService.firestore.collection('users').doc(params.uid);
		const snapshot = await userRef.get();

		if (!snapshot.exists) {
			const now = new Date().toISOString();
			const data: UserDocument = {
				fullName: params.fullName ?? '',
				displayName: params.displayName ?? params.fullName ?? '',
				email: params.email,
				matches: [],
				adoptions: [],
				phone: '',
				location: '',
				bio: '',
				createdAt: now,
				updatedAt: now,
			};

			await userRef.set(data);
			return this.mapUser(params.uid, data);
		}

		const existing = snapshot.data() as UserDocument;
		if (!existing.email) {
			await userRef.update({
				email: params.email,
				updatedAt: new Date().toISOString(),
			});
			existing.email = params.email;
		}

		return this.mapUser(params.uid, existing);
	}

	async getById(id: string): Promise<UserProfile> {
		const snapshot = await this.firebaseService.firestore.collection('users').doc(id).get();
		if (!snapshot.exists) {
			throw new NotFoundException('User not found');
		}

		return this.mapUser(id, snapshot.data() as UserDocument);
	}

	async findByUsername(username: string): Promise<UserProfile | null> {
		const byDisplayName = await this.firebaseService.firestore
			.collection('users')
			.where('displayName', '==', username)
			.limit(1)
			.get();

		if (!byDisplayName.empty) {
			const doc = byDisplayName.docs[0];
			return this.mapUser(doc.id, doc.data() as UserDocument);
		}

		const byFullName = await this.firebaseService.firestore
			.collection('users')
			.where('fullName', '==', username)
			.limit(1)
			.get();

		if (byFullName.empty) {
			return null;
		}

		const doc = byFullName.docs[0];
		return this.mapUser(doc.id, doc.data() as UserDocument);
	}

	async updateMe(uid: string, dto: UpdateUserDto): Promise<UserProfile> {
		const ref = this.firebaseService.firestore.collection('users').doc(uid);
		const snapshot = await ref.get();
		if (!snapshot.exists) {
			throw new NotFoundException('User not found');
		}

		const patch: Record<string, unknown> = {
			...dto,
			updatedAt: new Date().toISOString(),
		};

		await ref.update(patch);
		const updated = await ref.get();
		return this.mapUser(uid, updated.data() as UserDocument);
	}

	async getProfile(id: string): Promise<UserProfileStats> {
		const user = await this.getById(id);
		const petsSnapshot = await this.firebaseService.firestore
			.collection('pets')
			.where('ownerId', '==', id)
			.get();

		return {
			...user,
			publishedPetsCount: petsSnapshot.size,
			matchesCount: user.matches.length,
			adoptionsCount: user.adoptions.length,
		};
	}

	async getMatches(id: string): Promise<Pet[]> {
		const user = await this.getById(id);
		return this.getPetsByIds(user.matches);
	}

	async getAdoptions(id: string): Promise<Pet[]> {
		const user = await this.getById(id);
		return this.getPetsByIds(user.adoptions);
	}

	async removePetFromAllMatches(petId: string) {
		const usersSnapshot = await this.firebaseService.firestore
			.collection('users')
			.where('matches', 'array-contains', petId)
			.get();

		if (usersSnapshot.empty) {
			return;
		}

		const batch = this.firebaseService.firestore.batch();
		for (const userDoc of usersSnapshot.docs) {
			batch.update(userDoc.ref, {
				matches: FieldValue.arrayRemove(petId),
				updatedAt: new Date().toISOString(),
			});
		}

		await batch.commit();
	}

	private async getPetsByIds(ids: string[]): Promise<Pet[]> {
		if (ids.length === 0) {
			return [];
		}

		const snapshots = await Promise.all(
			ids.map((petId) => this.firebaseService.firestore.collection('pets').doc(petId).get()),
		);

		return snapshots
			.filter((doc) => doc.exists)
			.map((doc) => this.mapPet(doc.id, doc.data() as PetDocument));
	}

	private mapUser(id: string, data: UserDocument): UserProfile {
		return {
			id,
			fullName: data.fullName ?? '',
			displayName: data.displayName ?? data.fullName ?? '',
			email: data.email,
			matches: data.matches ?? [],
			adoptions: data.adoptions ?? [],
			phone: data.phone ?? '',
			location: data.location ?? '',
			bio: data.bio ?? '',
			createdAt: this.firebaseService.toIsoString(data.createdAt),
			updatedAt: this.firebaseService.toIsoString(data.updatedAt),
		};
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
			status: data.status as Pet['status'],
			ownerId: data.ownerId,
			photoUrl: data.photoUrl ?? null,
			createdAt: this.firebaseService.toIsoString(data.createdAt),
			updatedAt: this.firebaseService.toIsoString(data.updatedAt),
		};
	}
}
