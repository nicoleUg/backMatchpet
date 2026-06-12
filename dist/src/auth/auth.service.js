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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase/firebase.service");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    firebaseService;
    usersService;
    constructor(firebaseService, usersService) {
        this.firebaseService = firebaseService;
        this.usersService = usersService;
    }
    async register(dto) {
        const authResponse = await this.firebaseIdentityRequest('accounts:signUp', {
            email: dto.email,
            password: dto.password,
            returnSecureToken: true,
        });
        const uid = authResponse.localId;
        await this.firebaseService.auth.updateUser(uid, {
            displayName: dto.displayName ?? dto.fullName,
        });
        const user = await this.usersService.ensureUserDocument({
            uid,
            email: dto.email,
            fullName: dto.fullName,
            displayName: dto.displayName ?? dto.fullName,
        });
        await this.createSession(uid, authResponse.idToken);
        return {
            user,
            tokens: {
                idToken: authResponse.idToken,
                refreshToken: authResponse.refreshToken,
                expiresIn: authResponse.expiresIn,
            },
        };
    }
    async login(dto) {
        const authResponse = await this.firebaseIdentityRequest('accounts:signInWithPassword', {
            email: dto.email,
            password: dto.password,
            returnSecureToken: true,
        });
        const uid = authResponse.localId;
        const user = await this.usersService.ensureUserDocument({
            uid,
            email: dto.email,
        });
        await this.createSession(uid, authResponse.idToken);
        return {
            user,
            tokens: {
                idToken: authResponse.idToken,
                refreshToken: authResponse.refreshToken,
                expiresIn: authResponse.expiresIn,
            },
        };
    }
    async loginByUsername(username, password) {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        return this.login({
            email: user.email,
            password,
        });
    }
    async getMe(uid) {
        return this.usersService.getById(uid);
    }
    async logout(uid) {
        await this.firebaseService.auth.revokeRefreshTokens(uid);
        await this.deactivateSessions(uid);
        return {
            success: true,
            message: 'Session revoked. Client should remove stored tokens.',
        };
    }
    async getActiveSessions(limit = 50) {
        const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 1000)) : 50;
        const snapshot = await this.firebaseService.firestore
            .collection('sessions')
            .where('isActive', '==', true)
            .orderBy('lastActivityAt', 'desc')
            .limit(safeLimit)
            .get();
        const sessions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return {
            totalActiveSessions: snapshot.size,
            sessions,
            timestamp: new Date().toISOString(),
        };
    }
    async createSession(uid, idToken) {
        const now = new Date().toISOString();
        await this.firebaseService.firestore.collection('sessions').add({
            uid,
            isActive: true,
            tokenSuffix: idToken.slice(-12),
            createdAt: now,
            lastActivityAt: now,
        });
    }
    async deactivateSessions(uid) {
        const snapshot = await this.firebaseService.firestore
            .collection('sessions')
            .where('uid', '==', uid)
            .where('isActive', '==', true)
            .get();
        if (snapshot.empty) {
            return;
        }
        const batch = this.firebaseService.firestore.batch();
        for (const doc of snapshot.docs) {
            batch.update(doc.ref, {
                isActive: false,
                lastActivityAt: new Date().toISOString(),
            });
        }
        await batch.commit();
    }
    async firebaseIdentityRequest(method, payload) {
        const webApiKey = process.env.FIREBASE_WEB_API_KEY;
        if (!webApiKey) {
            throw new common_1.InternalServerErrorException('FIREBASE_WEB_API_KEY is required for auth endpoints');
        }
        const endpoint = `https://identitytoolkit.googleapis.com/v1/${method}?key=${webApiKey}`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const body = (await response.json());
        if (!response.ok) {
            const errorMessage = body.error?.message ?? 'Firebase authentication failed';
            if (errorMessage.includes('EMAIL_EXISTS')) {
                throw new common_1.BadRequestException('Email already registered');
            }
            if (errorMessage.includes('INVALID_LOGIN_CREDENTIALS') ||
                errorMessage.includes('INVALID_PASSWORD') ||
                errorMessage.includes('EMAIL_NOT_FOUND')) {
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            throw new common_1.BadRequestException(errorMessage);
        }
        return body;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map