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
exports.FirebaseAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase/firebase.service");
let FirebaseAuthGuard = class FirebaseAuthGuard {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        if (process.env.BYPASS_AUTH_FOR_TESTS === 'true') {
            request.user = {
                uid: 'jmeter-test-uid',
                email: 'jmeter-test@example.com',
                name: 'JMeter Test User',
            };
            return true;
        }
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Missing or invalid Authorization header');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new common_1.UnauthorizedException('Missing access token');
        }
        try {
            const decodedToken = await this.firebaseService.auth.verifyIdToken(token);
            request.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name,
            };
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.FirebaseAuthGuard = FirebaseAuthGuard;
exports.FirebaseAuthGuard = FirebaseAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirebaseAuthGuard);
//# sourceMappingURL=firebase-auth.guard.js.map