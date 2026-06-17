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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyAuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const legacy_register_dto_1 = require("./dto/legacy-register.dto");
const legacy_login_dto_1 = require("./dto/legacy-login.dto");
const firebase_auth_guard_1 = require("./guards/firebase-auth.guard");
let LegacyAuthController = class LegacyAuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    register(dto) {
        return this.authService.register({
            fullName: dto.username,
            displayName: dto.username,
            email: dto.email,
            password: dto.password,
        });
    }
    login(dto) {
        return this.authService.loginByUsername(dto.username, dto.password);
    }
    sessions(limit) {
        return this.authService.getActiveSessions(limit ? Number(limit) : 50);
    }
};
exports.LegacyAuthController = LegacyAuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [legacy_register_dto_1.LegacyRegisterDto]),
    __metadata("design:returntype", void 0)
], LegacyAuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [legacy_login_dto_1.LegacyLoginDto]),
    __metadata("design:returntype", void 0)
], LegacyAuthController.prototype, "login", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, common_1.Get)('sessions'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LegacyAuthController.prototype, "sessions", null);
exports.LegacyAuthController = LegacyAuthController = __decorate([
    (0, swagger_1.ApiTags)('legacy-auth'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], LegacyAuthController);
//# sourceMappingURL=legacy-auth.controller.js.map