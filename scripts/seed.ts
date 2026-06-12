import * as admin from 'firebase-admin';

type PetSeed = {
  name: string;
  species: string;
  gender: string;
  age: number;
  breed: string;
  personality: string;
  photoUrl: string | null;
};

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
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replaceAll(
    String.raw`\\n`,
    '\n',
  );

  if (projectId && clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }

  return admin.initializeApp({ projectId });
}

async function upsertTestUser(auth: admin.auth.Auth, db: admin.firestore.Firestore) {
  const email = 'demo@matchpet.app';
  const password = process.env.SEED_TEST_PASSWORD;
  const uid = 'matchpet-demo-user';

  if (!password) {
    throw new Error('SEED_TEST_PASSWORD is required for seeding test auth user');
  }

  try {
    await auth.getUser(uid);
  } catch {
    await auth.createUser({
      uid,
      email,
      password,
      displayName: 'Demo MatchPet',
    });
  }

  const now = new Date().toISOString();
  await db.collection('users').doc(uid).set(
    {
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
    },
    { merge: true },
  );

  return { uid, email, password };
}

async function seedPets(db: admin.firestore.Firestore, ownerId: string) {
  const pets: PetSeed[] = [
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

void runSeed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
