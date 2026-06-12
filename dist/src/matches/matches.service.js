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
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const firestore_1 = require("firebase-admin/firestore");
const firebase_service_1 = require("../firebase/firebase/firebase.service");
const pet_interface_1 = require("../pets/interfaces/pet.interface");
let MatchesService = class MatchesService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async likePet(userId, petId) {
        const userRef = this.firebaseService.firestore.collection('users').doc(userId);
        const petRef = this.firebaseService.firestore.collection('pets').doc(petId);
        const [userSnapshot, petSnapshot] = await Promise.all([userRef.get(), petRef.get()]);
        if (!userSnapshot.exists) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!petSnapshot.exists) {
            throw new common_1.NotFoundException('Pet not found');
        }
        const petData = petSnapshot.data();
        if (petData.status === pet_interface_1.PetStatus.ADOPTED) {
            throw new common_1.ConflictException('Adopted pets cannot be liked');
        }
        const userData = userSnapshot.data();
        const currentMatches = userData.matches ?? [];
        if (!currentMatches.includes(petId)) {
            await userRef.update({
                matches: firestore_1.FieldValue.arrayUnion(petId),
                updatedAt: new Date().toISOString(),
            });
        }
        const updatedUser = await userRef.get();
        const updatedMatches = updatedUser.data().matches ?? [];
        return {
            success: true,
            petId,
            matches: updatedMatches,
            matchesCount: updatedMatches.length,
        };
    }
    async listMatchesForUser(userId) {
        const userSnapshot = await this.firebaseService.firestore
            .collection('users')
            .doc(userId)
            .get();
        if (!userSnapshot.exists) {
            throw new common_1.NotFoundException('User not found');
        }
        const ids = userSnapshot.data().matches ?? [];
        if (ids.length === 0) {
            return [];
        }
        const petSnapshots = await Promise.all(ids.map((petId) => this.firebaseService.firestore.collection('pets').doc(petId).get()));
        return petSnapshots
            .filter((doc) => doc.exists)
            .map((doc) => this.mapPet(doc.id, doc.data()))
            .filter((pet) => pet.status !== pet_interface_1.PetStatus.ADOPTED);
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
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], MatchesService);
//# sourceMappingURL=matches.service.js.map