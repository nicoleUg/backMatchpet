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
exports.AdoptionsService = void 0;
const common_1 = require("@nestjs/common");
const firestore_1 = require("firebase-admin/firestore");
const firebase_service_1 = require("../firebase/firebase/firebase.service");
const pet_interface_1 = require("../pets/interfaces/pet.interface");
const users_service_1 = require("../users/users.service");
let AdoptionsService = class AdoptionsService {
    firebaseService;
    usersService;
    constructor(firebaseService, usersService) {
        this.firebaseService = firebaseService;
        this.usersService = usersService;
    }
    async adoptPet(userId, petId) {
        const userRef = this.firebaseService.firestore.collection('users').doc(userId);
        const petRef = this.firebaseService.firestore.collection('pets').doc(petId);
        await this.firebaseService.firestore.runTransaction(async (transaction) => {
            const [userSnapshot, petSnapshot] = await Promise.all([
                transaction.get(userRef),
                transaction.get(petRef),
            ]);
            if (!userSnapshot.exists) {
                throw new common_1.NotFoundException('User not found');
            }
            if (!petSnapshot.exists) {
                throw new common_1.NotFoundException('Pet not found');
            }
            const pet = petSnapshot.data();
            if (pet.status === pet_interface_1.PetStatus.ADOPTED) {
                throw new common_1.ConflictException('Pet is already adopted');
            }
            const now = new Date().toISOString();
            transaction.update(petRef, {
                status: pet_interface_1.PetStatus.ADOPTED,
                ownerId: userId,
                updatedAt: now,
            });
            transaction.update(userRef, {
                adoptions: firestore_1.FieldValue.arrayUnion(petId),
                matches: firestore_1.FieldValue.arrayRemove(petId),
                updatedAt: now,
            });
        });
        await this.usersService.removePetFromAllMatches(petId);
        const updatedPet = await petRef.get();
        if (!updatedPet.exists) {
            throw new common_1.NotFoundException('Pet not found after adoption');
        }
        return this.mapPet(updatedPet.id, updatedPet.data());
    }
    async listAdoptionsForUser(userId) {
        const userSnapshot = await this.firebaseService.firestore
            .collection('users')
            .doc(userId)
            .get();
        if (!userSnapshot.exists) {
            throw new common_1.NotFoundException('User not found');
        }
        const ids = userSnapshot.data().adoptions ?? [];
        if (ids.length === 0) {
            return [];
        }
        const petSnapshots = await Promise.all(ids.map((petId) => this.firebaseService.firestore.collection('pets').doc(petId).get()));
        return petSnapshots
            .filter((doc) => doc.exists)
            .map((doc) => this.mapPet(doc.id, doc.data()));
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
exports.AdoptionsService = AdoptionsService;
exports.AdoptionsService = AdoptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        users_service_1.UsersService])
], AdoptionsService);
//# sourceMappingURL=adoptions.service.js.map