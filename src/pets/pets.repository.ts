import { Injectable, NotFoundException } from '@nestjs/common';
import { CollectionReference, DocumentData, Query, Timestamp } from 'firebase-admin/firestore';
import { FirebaseService } from '../firebase/firebase/firebase.service';
import { Pet, PetStatus } from './interfaces/pet.interface';
import { CreatePetDto } from './dto/create-pet.dto';
import { QueryPetsDto } from './dto/query-pets.dto';

export interface PetDocument {
	name: string;
	species: string;
	gender: string;
	age: number;
	breed: string;
	personality: string;
	status: PetStatus;
	ownerId: string;
	photoUrl: string | null;
	createdAt: Timestamp | string;
	updatedAt: Timestamp | string;
}

@Injectable()
export class PetsRepository {
	private readonly collection: CollectionReference<DocumentData>;

	constructor(private readonly firebaseService: FirebaseService) {
		this.collection = this.firebaseService.firestore.collection('pets');
	}

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

		const docRef = await this.collection.add(payload);
		const created = await docRef.get();
		return this.mapPet(created.id, created.data() as PetDocument);
	}

	async findAll(query: QueryPetsDto): Promise<Pet[]> {
		let firestoreQuery: Query<DocumentData> = this.collection;

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

	async findById(id: string): Promise<Pet | null> {
		const doc = await this.collection.doc(id).get();
		if (!doc.exists) {
			return null;
		}
		return this.mapPet(id, doc.data() as PetDocument);
	}

	async update(id: string, data: Partial<PetDocument>): Promise<Pet> {
		const ref = this.collection.doc(id);
		await ref.update({
			...data,
			updatedAt: new Date().toISOString(),
		});
		const updated = await ref.get();
		return this.mapPet(updated.id, updated.data() as PetDocument);
	}

	async remove(id: string): Promise<void> {
		await this.collection.doc(id).delete();
	}

	getCollectionRef(): CollectionReference<DocumentData> {
		return this.collection;
	}

	mapPet(id: string, data: PetDocument): Pet {
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
