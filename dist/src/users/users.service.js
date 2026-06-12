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
const firebase_service_1 = require("../firebase/firebase/firebase.service");
let UsersService = class UsersService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async ensureUserDocument(params) {
        const userRef = this.firebaseService.firestore.collection('users').doc(params.uid);
        const snapshot = await userRef.get();
        if (!snapshot.exists) {
            const now = new Date().toISOString();
            const data = {
                fullName: params.fullName ?? '',
                displayName: params.displayName ?? params.fullName ?? '',
                email: params.email,
                matches: [],
                adoptions: [],
                phone: '',
                location: '',
                bio: '',
                createdAt: now,
                updatedAt: now,
            };
            await userRef.set(data);
            return this.mapUser(params.uid, data);
        }
        const existing = snapshot.data();
        if (!existing.email) {
            await userRef.update({
                email: params.email,
                updatedAt: new Date().toISOString(),
            });
            existing.email = params.email;
        }
        return this.mapUser(params.uid, existing);
    }
    async getById(id) {
        const snapshot = await this.firebaseService.firestore.collection('users').doc(id).get();
        if (!snapshot.exists) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.mapUser(id, snapshot.data());
    }
    async findByUsername(username) {
        const byDisplayName = await this.firebaseService.firestore
            .collection('users')
            .where('displayName', '==', username)
            .limit(1)
            .get();
        if (!byDisplayName.empty) {
            const doc = byDisplayName.docs[0];
            return this.mapUser(doc.id, doc.data());
        }
        const byFullName = await this.firebaseService.firestore
            .collection('users')
            .where('fullName', '==', username)
            .limit(1)
            .get();
        if (byFullName.empty) {
            return null;
        }
        const doc = byFullName.docs[0];
        return this.mapUser(doc.id, doc.data());
    }
    async updateMe(uid, dto) {
        const ref = this.firebaseService.firestore.collection('users').doc(uid);
        const snapshot = await ref.get();
        if (!snapshot.exists) {
            throw new common_1.NotFoundException('User not found');
        }
        const patch = {
            ...dto,
            updatedAt: new Date().toISOString(),
        };
        await ref.update(patch);
        const updated = await ref.get();
        return this.mapUser(uid, updated.data());
    }
    async getProfile(id) {
        const user = await this.getById(id);
        const petsSnapshot = await this.firebaseService.firestore
            .collection('pets')
            .where('ownerId', '==', id)
            .get();
        return {
            ...user,
            publishedPetsCount: petsSnapshot.size,
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
        const usersSnapshot = await this.firebaseService.firestore
            .collection('users')
            .where('matches', 'array-contains', petId)
            .get();
        if (usersSnapshot.empty) {
            return;
        }
        const batch = this.firebaseService.firestore.batch();
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
        const snapshots = await Promise.all(ids.map((petId) => this.firebaseService.firestore.collection('pets').doc(petId).get()));
        return snapshots
            .filter((doc) => doc.exists)
            .map((doc) => this.mapPet(doc.id, doc.data()));
    }
    mapUser(id, data) {
        return {
            id,
            fullName: data.fullName ?? '',
            displayName: data.displayName ?? data.fullName ?? '',
            email: data.email,
            matches: data.matches ?? [],
            adoptions: data.adoptions ?? [],
            phone: data.phone ?? '',
            location: data.location ?? '',
            bio: data.bio ?? '',
            createdAt: this.firebaseService.toIsoString(data.createdAt),
            updatedAt: this.firebaseService.toIsoString(data.updatedAt),
        };
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
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map