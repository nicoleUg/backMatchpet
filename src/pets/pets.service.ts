import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Query } from 'firebase-admin/firestore';
import { FirebaseService } from '../firebase/firebase/firebase.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { QueryPetsDto } from './dto/query-pets.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet, PetStatus } from './interfaces/pet.interface';
import { MatchesService } from '../matches/matches.service';
import { AdoptionsService } from '../adoptions/adoptions.service';

interface PetDocument {
	name: string;
	species: string;
	gender: string;
	age: number;
	breed: string;
	personality: string;
	status: PetStatus;
	ownerId: string;
	photoUrl: string | null;
	createdAt: string;
	updatedAt: string;
}

@Injectable()
export class PetsService {
	constructor(
		private readonly firebaseService: FirebaseService,
		private readonly matchesService: MatchesService,
		private readonly adoptionsService: AdoptionsService,
	) {}

	async create(ownerId: string, dto: CreatePetDto): Promise<Pet> {
		const now = new Date().toISOString();
		const payload: PetDocument = {
			name: dto.name,
			species: dto.species,
			gender: dto.gender,
			age: dto.age,
			breed: dto.breed,
			personality: dto.personality,
			status: PetStatus.AVAILABLE,
			ownerId,
			photoUrl: dto.photoUrl ?? null,
			createdAt: now,
			updatedAt: now,
		};

		const docRef = await this.firebaseService.firestore.collection('pets').add(payload);
		const created = await docRef.get();
		return this.mapPet(created.id, created.data() as PetDocument);
	}

	async findAll(query: QueryPetsDto): Promise<Pet[]> {
		let firestoreQuery: Query = this.firebaseService.firestore.collection('pets');

		if (query.species) {
			firestoreQuery = firestoreQuery.where('species', '==', query.species);
		}

		if (query.status) {
			firestoreQuery = firestoreQuery.where('status', '==', query.status);
		}

		if (query.ownerId) {
			firestoreQuery = firestoreQuery.where('ownerId', '==', query.ownerId);
		}

		if (query.gender) {
			firestoreQuery = firestoreQuery.where('gender', '==', query.gender);
		}

		if (typeof query.minAge === 'number') {
			firestoreQuery = firestoreQuery.where('age', '>=', query.minAge);
		}

		if (typeof query.maxAge === 'number') {
			firestoreQuery = firestoreQuery.where('age', '<=', query.maxAge);
		}

		const snapshot = await firestoreQuery.get();
		let pets = snapshot.docs.map((doc) => this.mapPet(doc.id, doc.data() as PetDocument));

		if (query.name) {
			const needle = query.name.toLowerCase();
			pets = pets.filter((pet) => pet.name.toLowerCase().includes(needle));
		}

		if (query.breed) {
			const needle = query.breed.toLowerCase();
			pets = pets.filter((pet) => pet.breed.toLowerCase().includes(needle));
		}

		return pets;
	}

	async findOne(id: string): Promise<Pet> {
		const snapshot = await this.firebaseService.firestore.collection('pets').doc(id).get();
		if (!snapshot.exists) {
			throw new NotFoundException('Pet not found');
		}

		return this.mapPet(id, snapshot.data() as PetDocument);
	}

	async update(ownerId: string, petId: string, dto: UpdatePetDto): Promise<Pet> {
		const ref = this.firebaseService.firestore.collection('pets').doc(petId);
		const snapshot = await ref.get();
		if (!snapshot.exists) {
			throw new NotFoundException('Pet not found');
		}

		const current = snapshot.data() as PetDocument;
		if (current.ownerId !== ownerId) {
			throw new ForbiddenException('You can only edit your own pets');
		}

		await ref.update({
			...dto,
			updatedAt: new Date().toISOString(),
		});

		const updated = await ref.get();
		return this.mapPet(updated.id, updated.data() as PetDocument);
	}

	async remove(ownerId: string, petId: string) {
		const ref = this.firebaseService.firestore.collection('pets').doc(petId);
		const snapshot = await ref.get();

		if (!snapshot.exists) {
			throw new NotFoundException('Pet not found');
		}

		const pet = snapshot.data() as PetDocument;
		if (pet.ownerId !== ownerId) {
			throw new ForbiddenException('You can only delete your own pets');
		}

		await ref.delete();
		return {
			success: true,
			deletedId: petId,
		};
	}

	async likePet(userId: string, petId: string) {
		return this.matchesService.likePet(userId, petId);
	}

	async adoptPet(userId: string, petId: string) {
		return this.adoptionsService.adoptPet(userId, petId);
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
			status: data.status,
			ownerId: data.ownerId,
			photoUrl: data.photoUrl ?? null,
			createdAt: this.firebaseService.toIsoString(data.createdAt),
			updatedAt: this.firebaseService.toIsoString(data.updatedAt),
		};
	}
}
