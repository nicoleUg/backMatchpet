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
const pets_repository_1 = require("../pets/pets.repository");
const users_repository_1 = require("../users/users.repository");
const pet_interface_1 = require("../pets/interfaces/pet.interface");
let MatchesService = class MatchesService {
    petsRepository;
    usersRepository;
    constructor(petsRepository, usersRepository) {
        this.petsRepository = petsRepository;
        this.usersRepository = usersRepository;
    }
    async likePet(userId, petId) {
        const [user, pet] = await Promise.all([
            this.usersRepository.findById(userId),
            this.petsRepository.findById(petId),
        ]);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!pet) {
            throw new common_1.NotFoundException('Pet not found');
        }
        if (pet.status === pet_interface_1.PetStatus.ADOPTED) {
            throw new common_1.ConflictException('Adopted pets cannot be liked');
        }
        const currentMatches = user.matches ?? [];
        if (!currentMatches.includes(petId)) {
            const userRef = this.usersRepository.getCollectionRef().doc(userId);
            await userRef.update({
                matches: firestore_1.FieldValue.arrayUnion(petId),
                updatedAt: new Date().toISOString(),
            });
        }
        const updatedUser = await this.usersRepository.findById(userId);
        const updatedMatches = updatedUser?.matches ?? [];
        return {
            success: true,
            petId,
            matches: updatedMatches,
            matchesCount: updatedMatches.length,
        };
    }
    async listMatchesForUser(userId) {
        const user = await this.usersRepository.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const ids = user.matches ?? [];
        if (ids.length === 0) {
            return [];
        }
        const pets = await Promise.all(ids.map((petId) => this.petsRepository.findById(petId)));
        return pets
            .filter((pet) => pet !== null)
            .filter((pet) => pet.status !== pet_interface_1.PetStatus.ADOPTED);
    }
};
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pets_repository_1.PetsRepository,
        users_repository_1.UsersRepository])
], MatchesService);
//# sourceMappingURL=matches.service.js.map