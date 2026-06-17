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
const pets_repository_1 = require("../pets/pets.repository");
const users_repository_1 = require("../users/users.repository");
const users_service_1 = require("../users/users.service");
const pet_interface_1 = require("../pets/interfaces/pet.interface");
let AdoptionsService = class AdoptionsService {
    petsRepository;
    usersRepository;
    usersService;
    constructor(petsRepository, usersRepository, usersService) {
        this.petsRepository = petsRepository;
        this.usersRepository = usersRepository;
        this.usersService = usersService;
    }
    async adoptPet(userId, petId) {
        const userRef = this.usersRepository.getCollectionRef().doc(userId);
        const petRef = this.petsRepository.getCollectionRef().doc(petId);
        await this.usersRepository.getCollectionRef().firestore.runTransaction(async (transaction) => {
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
        const updatedPet = await this.petsRepository.findById(petId);
        if (!updatedPet) {
            throw new common_1.NotFoundException('Pet not found after adoption');
        }
        return updatedPet;
    }
    async listAdoptionsForUser(userId) {
        const user = await this.usersRepository.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const ids = user.adoptions ?? [];
        if (ids.length === 0) {
            return [];
        }
        const pets = await Promise.all(ids.map((petId) => this.petsRepository.findById(petId)));
        return pets.filter((pet) => pet !== null);
    }
};
exports.AdoptionsService = AdoptionsService;
exports.AdoptionsService = AdoptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pets_repository_1.PetsRepository,
        users_repository_1.UsersRepository,
        users_service_1.UsersService])
], AdoptionsService);
//# sourceMappingURL=adoptions.service.js.map