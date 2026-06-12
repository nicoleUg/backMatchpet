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
exports.QueryPetsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const pet_interface_1 = require("../interfaces/pet.interface");
class QueryPetsDto {
    species;
    status;
    ownerId;
    name;
    breed;
    gender;
    minAge;
    maxAge;
}
exports.QueryPetsDto = QueryPetsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'dog' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPetsDto.prototype, "species", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: pet_interface_1.PetStatus, example: pet_interface_1.PetStatus.AVAILABLE }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(pet_interface_1.PetStatus),
    __metadata("design:type", String)
], QueryPetsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'firebase-uid-owner' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPetsDto.prototype, "ownerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Luna' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPetsDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Labrador' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPetsDto.prototype, "breed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'female' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPetsDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(40),
    __metadata("design:type", Number)
], QueryPetsDto.prototype, "minAge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 6 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(40),
    __metadata("design:type", Number)
], QueryPetsDto.prototype, "maxAge", void 0);
//# sourceMappingURL=query-pets.dto.js.map