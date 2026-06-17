import { Injectable, NotFoundException } from '@nestjs/common';
import { FieldValue } from 'firebase-admin/firestore';
import { UsersRepository } from './users.repository';
import { PetsRepository } from '../pets/pets.repository';
import { UserProfile, UserProfileStats } from './interfaces/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { Pet } from '../pets/interfaces/pet.interface';

interface EnsureUserParams {
	uid: string;
	email: string;
	fullName?: string;
	displayName?: string;
}

@Injectable()
export class UsersService {
	constructor(
		private readonly usersRepository: UsersRepository,
		private readonly petsRepository: PetsRepository,
	) {}

	async ensureUserDocument(params: EnsureUserParams): Promise<UserProfile> {
		return this.usersRepository.ensureUserDocument(params);
	}

	async getById(id: string): Promise<UserProfile> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	async findByUsername(username: string): Promise<UserProfile | null> {
		const byDisplayName = await this.usersRepository.findByDisplayName(username);
		if (byDisplayName) {
			return byDisplayName;
		}

		return this.usersRepository.findByFullName(username);
	}

	async updateMe(uid: string, dto: UpdateUserDto): Promise<UserProfile> {
		const user = await this.usersRepository.findById(uid);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return this.usersRepository.update(uid, dto);
	}

	async getProfile(id: string): Promise<UserProfileStats> {
		const user = await this.getById(id);
		const publishedPets = await this.petsRepository.findAll({ ownerId: id });

		return {
			...user,
			publishedPetsCount: publishedPets.length,
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
		const usersSnapshot = await this.usersRepository.findUsersByMatch(petId);
		if (usersSnapshot.empty) {
			return;
		}

		const batch = this.usersRepository.getCollectionRef().firestore.batch();
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
			ids.map((petId) => this.petsRepository.findById(petId)),
		);

		return snapshots.filter((pet): pet is Pet => pet !== null);
	}
}
