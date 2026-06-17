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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const firestore_1 = require("firebase-admin/firestore");
const users_repository_1 = require("./users.repository");
const pets_repository_1 = require("../pets/pets.repository");
let UsersService = class UsersService {
    usersRepository;
    petsRepository;
    constructor(usersRepository, petsRepository) {
        this.usersRepository = usersRepository;
        this.petsRepository = petsRepository;
    }
    async ensureUserDocument(params) {
        return this.usersRepository.ensureUserDocument(params);
    }
    async getById(id) {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByUsername(username) {
        const byDisplayName = await this.usersRepository.findByDisplayName(username);
        if (byDisplayName) {
            return byDisplayName;
        }
        return this.usersRepository.findByFullName(username);
    }
    async updateMe(uid, dto) {
        const user = await this.usersRepository.findById(uid);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.usersRepository.update(uid, dto);
    }
    async getProfile(id) {
        const user = await this.getById(id);
        const publishedPets = await this.petsRepository.findAll({ ownerId: id });
        return {
            ...user,
            publishedPetsCount: publishedPets.length,
            matchesCount: user.matches.length,
            adoptionsCount: user.adoptions.length,
        };
    }
    async getMatches(id) {
        const user = await this.getById(id);
        return this.getPetsByIds(user.matches);
    }
    async getAdoptions(id) {
        const user = await this.getById(id);
        return this.getPetsByIds(user.adoptions);
    }
    async removePetFromAllMatches(petId) {
        const usersSnapshot = await this.usersRepository.findUsersByMatch(petId);
        if (usersSnapshot.empty) {
            return;
        }
        const batch = this.usersRepository.getCollectionRef().firestore.batch();
        for (const userDoc of usersSnapshot.docs) {
            batch.update(userDoc.ref, {
                matches: firestore_1.FieldValue.arrayRemove(petId),
                updatedAt: new Date().toISOString(),
            });
        }
        await batch.commit();
    }
    async getPetsByIds(ids) {
        if (ids.length === 0) {
            return [];
        }
        const snapshots = await Promise.all(ids.map((petId) => this.petsRepository.findById(petId)));
        return snapshots.filter((pet) => pet !== null);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        pets_repository_1.PetsRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map