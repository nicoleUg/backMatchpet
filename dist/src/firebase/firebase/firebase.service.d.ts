import * as admin from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore';
export declare class FirebaseService {
    readonly app: admin.app.App;
    readonly firestore: Firestore;
    readonly auth: admin.auth.Auth;
    constructor();
    private initializeApp;
    toIsoString(value: unknown): string;
}
