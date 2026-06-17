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
const pets_repository_1 = require("./pets.repository");
let PetsService = class PetsService {
    petsRepository;
    constructor(petsRepository) {
        this.petsRepository = petsRepository;
    }
    async create(ownerId, dto) {
        return this.petsRepository.create(ownerId, dto);
    }
    async findAll(query) {
        return this.petsRepository.findAll(query);
    }
    async findOne(id) {
        const pet = await this.petsRepository.findById(id);
        if (!pet) {
            throw new common_1.NotFoundException('Pet not found');
        }
        return pet;
    }
    async update(ownerId, petId, dto) {
        const pet = await this.petsRepository.findById(petId);
        if (!pet) {
            throw new common_1.NotFoundException('Pet not found');
        }
        if (pet.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('You can only edit your own pets');
        }
        return this.petsRepository.update(petId, dto);
    }
    async remove(ownerId, petId) {
        const pet = await this.petsRepository.findById(petId);
        if (!pet) {
            throw new common_1.NotFoundException('Pet not found');
        }
        if (pet.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('You can only delete your own pets');
        }
        await this.petsRepository.remove(petId);
        return {
            success: true,
            deletedId: petId,
        };
    }
};
exports.PetsService = PetsService;
exports.PetsService = PetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pets_repository_1.PetsRepository])
], PetsService);
//# sourceMappingURL=pets.service.js.map