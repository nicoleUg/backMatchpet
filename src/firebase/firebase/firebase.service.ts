import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Firestore, Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class FirebaseService {
	readonly app: admin.app.App;
	readonly firestore: Firestore;
	readonly auth: admin.auth.Auth;

	constructor() {
		this.app = this.initializeApp();
		this.firestore = this.app.firestore();
		this.auth = this.app.auth();
	}

	private initializeApp(): admin.app.App {
		if (admin.apps.length > 0) {
			return admin.app();
		}

		const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
		if (serviceAccountJson) {
			const parsed = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
			return admin.initializeApp({
				credential: admin.credential.cert(parsed),
			});
		}

		const projectId = process.env.FIREBASE_PROJECT_ID;
		const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
		const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replaceAll(
			String.raw`\n`,
			'\n',
		);

		if (projectId && clientEmail && privateKey) {
			return admin.initializeApp({
				credential: admin.credential.cert({
					projectId,
					clientEmail,
					privateKey,
				}),
			});
		}

		return admin.initializeApp({
			projectId,
		});
	}

	toIsoString(value: unknown): string {
		if (value instanceof Timestamp) {
			return value.toDate().toISOString();
		}

		if (typeof value === 'string') {
			return value;
		}

		return new Date().toISOString();
	}
}
