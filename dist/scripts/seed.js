"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
function initializeFirebase() {
    if (admin.apps.length > 0) {
        return admin.app();
    }
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
        return admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
        });
    }
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replaceAll(String.raw `\\n`, '\n');
    if (projectId && clientEmail && privateKey) {
        return admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        });
    }
    return admin.initializeApp({ projectId });
}
async function upsertTestUser(auth, db) {
    const email = 'demo@matchpet.app';
    const password = process.env.SEED_TEST_PASSWORD;
    const uid = 'matchpet-demo-user';
    if (!password) {
        throw new Error('SEED_TEST_PASSWORD is required for seeding test auth user');
    }
    try {
        await auth.getUser(uid);
    }
    catch {
        await auth.createUser({
            uid,
            email,
            password,
            displayName: 'Demo MatchPet',
        });
    }
    const now = new Date().toISOString();
    await db.collection('users').doc(uid).set({
        fullName: 'Demo MatchPet',
        displayName: 'Demo MatchPet',
        email,
        matches: [],
        adoptions: [],
        phone: '+54 11 1111 1111',
        location: 'Buenos Aires',
        bio: 'Usuario semilla para pruebas locales de MatchPet.',
        createdAt: now,
        updatedAt: now,
    }, { merge: true });
    return { uid, email, password };
}
async function seedPets(db, ownerId) {
    const pets = [
        {
            name: 'Luna',
            species: 'dog',
            gender: 'female',
            age: 2,
            breed: 'Labrador',
            personality: 'Juguetona, cariñosa y muy sociable',
            photoUrl: null,
        },
        {
            name: 'Simba',
            species: 'cat',
            gender: 'male',
            age: 3,
            breed: 'Mestizo',
            personality: 'Tranquilo y curioso',
            photoUrl: null,
        },
        {
            name: 'Mora',
            species: 'dog',
            gender: 'female',
            age: 1,
            breed: 'Border Collie',
            personality: 'Activa e inteligente',
            photoUrl: null,
        },
    ];
    const now = new Date().toISOString();
    for (const pet of pets) {
        const existing = await db
            .collection('pets')
            .where('name', '==', pet.name)
            .where('ownerId', '==', ownerId)
            .limit(1)
            .get();
        if (!existing.empty) {
            continue;
        }
        await db.collection('pets').add({
            ...pet,
            status: 'available',
            ownerId,
            createdAt: now,
            updatedAt: now,
        });
    }
}
async function runSeed() {
    const app = initializeFirebase();
    const auth = app.auth();
    const db = app.firestore();
    const testUser = await upsertTestUser(auth, db);
    await seedPets(db, testUser.uid);
    console.log('Seed completed successfully.');
    console.log(`Test user: ${testUser.email}`);
    console.log(`Test password: ${testUser.password}`);
    process.exit(0);
}
void runSeed().catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map