import { Injectable } from '@nestjs/common';
import { CollectionReference, DocumentData, Timestamp } from 'firebase-admin/firestore';
import { FirebaseService } from '../firebase/firebase/firebase.service';
import { UserProfile } from './interfaces/user.interface';

export interface UserDocument {
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

interface EnsureUserParams {
	uid: string;
	email: string;
	fullName?: string;
	displayName?: string;
}

@Injectable()
export class UsersRepository {
	private readonly collection: CollectionReference<DocumentData>;

	constructor(private readonly firebaseService: FirebaseService) {
		this.collection = this.firebaseService.firestore.collection('users');
	}

	async ensureUserDocument(params: EnsureUserParams): Promise<UserProfile> {
		const userRef = this.collection.doc(params.uid);
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

	async findById(id: string): Promise<UserProfile | null> {
		const snapshot = await this.collection.doc(id).get();
		if (!snapshot.exists) {
			return null;
		}
		return this.mapUser(id, snapshot.data() as UserDocument);
	}

	async findByDisplayName(displayName: string): Promise<UserProfile | null> {
		const snapshot = await this.collection
			.where('displayName', '==', displayName)
			.limit(1)
			.get();

		if (snapshot.empty) {
			return null;
		}
		const doc = snapshot.docs[0];
		return this.mapUser(doc.id, doc.data() as UserDocument);
	}

	async findByFullName(fullName: string): Promise<UserProfile | null> {
		const snapshot = await this.collection
			.where('fullName', '==', fullName)
			.limit(1)
			.get();

		if (snapshot.empty) {
			return null;
		}
		const doc = snapshot.docs[0];
		return this.mapUser(doc.id, doc.data() as UserDocument);
	}

	async update(uid: string, patch: Partial<UserDocument>): Promise<UserProfile> {
		const ref = this.collection.doc(uid);
		await ref.update({
			...patch,
			updatedAt: new Date().toISOString(),
		});
		const updated = await ref.get();
		return this.mapUser(uid, updated.data() as UserDocument);
	}

	async findUsersByMatch(petId: string) {
		return this.collection
			.where('matches', 'array-contains', petId)
			.get();
	}

	getCollectionRef(): CollectionReference<DocumentData> {
		return this.collection;
	}

	mapUser(id: string, data: UserDocument): UserProfile {
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
}
