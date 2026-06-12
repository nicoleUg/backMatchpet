"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PetsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase/firebase.service");
const pet_interface_1 = require("./interfaces/pet.interface");
const matches_service_1 = require("../matches/matches.service");
const adoptions_service_1 = require("../adoptions/adoptions.service");
let PetsService = class PetsService {
    firebaseService;
    matchesService;
    adoptionsService;
    constructor(firebaseService, matchesService, adoptionsService) {
        this.firebaseService = firebaseService;
        this.matchesService = matchesService;
        this.adoptionsService = adoptionsService;
    }
    async create(ownerId, dto) {
        const now = new Date().toISOString();
        const payload = {
            name: dto.name,
            species: dto.species,
            gender: dto.gender,
            age: dto.age,
            breed: dto.breed,
            personality: dto.personality,
            status: pet_interface_1.PetStatus.AVAILABLE,
            ownerId,
            photoUrl: dto.photoUrl ?? null,
            createdAt: now,
            updatedAt: now,
        };
        const docRef = await this.firebaseService.firestore.collection('pets').add(payload);
        const created = await docRef.get();
        return this.mapPet(created.id, created.data());
    }
    async findAll(query) {
        let firestoreQuery = this.firebaseService.firestore.collection('pets');
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
        let pets = snapshot.docs.map((doc) => this.mapPet(doc.id, doc.data()));
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
    async findOne(id) {
        const snapshot = await this.firebaseService.firestore.collection('pets').doc(id).get();
        if (!snapshot.exists) {
            throw new common_1.NotFoundException('Pet not found');
        }
        return this.mapPet(id, snapshot.data());
    }
    async update(ownerId, petId, dto) {
        const ref = this.firebaseService.firestore.collection('pets').doc(petId);
        const snapshot = await ref.get();
        if (!snapshot.exists) {
            throw new common_1.NotFoundException('Pet not found');
        }
        const current = snapshot.data();
        if (current.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('You can only edit your own pets');
        }
        await ref.update({
            ...dto,
            updatedAt: new Date().toISOString(),
        });
        const updated = await ref.get();
        return this.mapPet(updated.id, updated.data());
    }
    async remove(ownerId, petId) {
        const ref = this.firebaseService.firestore.collection('pets').doc(petId);
        const snapshot = await ref.get();
        if (!snapshot.exists) {
            throw new common_1.NotFoundException('Pet not found');
        }
        const pet = snapshot.data();
        if (pet.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('You can only delete your own pets');
        }
        await ref.delete();
        return {
            success: true,
            deletedId: petId,
        };
    }
    async likePet(userId, petId) {
        return this.matchesService.likePet(userId, petId);
    }
    async adoptPet(userId, petId) {
        return this.adoptionsService.adoptPet(userId, petId);
    }
    mapPet(id, data) {
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
};
exports.PetsService = PetsService;
exports.PetsService = PetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        matches_service_1.MatchesService,
        adoptions_service_1.AdoptionsService])
], PetsService);
//# sourceMappingURL=pets.service.js.map