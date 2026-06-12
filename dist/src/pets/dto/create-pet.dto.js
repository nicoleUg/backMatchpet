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
exports.CreatePetDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreatePetDto {
    name;
    species;
    gender;
    age;
    breed;
    personality;
    photoUrl;
}
exports.CreatePetDto = CreatePetDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Luna' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreatePetDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'dog' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePetDto.prototype, "species", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'female' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePetDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(40),
    __metadata("design:type", Number)
], CreatePetDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Labrador' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePetDto.prototype, "breed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Juguetona y sociable' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePetDto.prototype, "personality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/pet.jpg' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePetDto.prototype, "photoUrl", void 0);
//# sourceMappingURL=create-pet.dto.js.map