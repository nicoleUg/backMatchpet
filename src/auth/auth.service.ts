import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase/firebase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly firebaseService: FirebaseService,
		private readonly usersService: UsersService,
	) {}

	async register(dto: RegisterDto) {
		const authResponse = await this.firebaseIdentityRequest('accounts:signUp', {
			email: dto.email,
			password: dto.password,
			returnSecureToken: true,
		});

		const uid = authResponse.localId as string;
		await this.firebaseService.auth.updateUser(uid, {
			displayName: dto.displayName ?? dto.fullName,
		});

		const user = await this.usersService.ensureUserDocument({
			uid,
			email: dto.email,
			fullName: dto.fullName,
			displayName: dto.displayName ?? dto.fullName,
		});

		await this.createSession(uid, authResponse.idToken as string);

		return {
			user,
			tokens: {
				idToken: authResponse.idToken,
				refreshToken: authResponse.refreshToken,
				expiresIn: authResponse.expiresIn,
			},
		};
	}

	async login(dto: LoginDto) {
		const authResponse = await this.firebaseIdentityRequest(
			'accounts:signInWithPassword',
			{
				email: dto.email,
				password: dto.password,
				returnSecureToken: true,
			},
		);

		const uid = authResponse.localId as string;
		const user = await this.usersService.ensureUserDocument({
			uid,
			email: dto.email,
		});

		await this.createSession(uid, authResponse.idToken as string);

		return {
			user,
			tokens: {
				idToken: authResponse.idToken,
				refreshToken: authResponse.refreshToken,
				expiresIn: authResponse.expiresIn,
			},
		};
	}

	async loginByUsername(username: string, password: string) {
		const user = await this.usersService.findByUsername(username);
		if (!user) {
			throw new UnauthorizedException('Invalid username or password');
		}

		return this.login({
			email: user.email,
			password,
		});
	}

	async getMe(uid: string) {
		return this.usersService.getById(uid);
	}

	async logout(uid: string) {
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

	private async createSession(uid: string, idToken: string) {
		const now = new Date().toISOString();
		await this.firebaseService.firestore.collection('sessions').add({
			uid,
			isActive: true,
			tokenSuffix: idToken.slice(-12),
			createdAt: now,
			lastActivityAt: now,
		});
	}

	private async deactivateSessions(uid: string) {
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

	private async firebaseIdentityRequest(
		method: 'accounts:signUp' | 'accounts:signInWithPassword',
		payload: Record<string, unknown>,
	) {
		const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
		const webApiKey = process.env.FIREBASE_WEB_API_KEY || (emulatorHost ? 'fake-web-api-key' : undefined);
		if (!webApiKey) {
			throw new InternalServerErrorException(
				'FIREBASE_WEB_API_KEY is required for auth endpoints',
			);
		}

		const endpoint = emulatorHost
			? `http://${emulatorHost}/identitytoolkit.googleapis.com/v1/${method}?key=${webApiKey}`
			: `https://identitytoolkit.googleapis.com/v1/${method}?key=${webApiKey}`;

		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		const body = (await response.json()) as {
			error?: { message?: string };
			[key: string]: unknown;
		};

		if (!response.ok) {
			const errorMessage = body.error?.message ?? 'Firebase authentication failed';
			if (errorMessage.includes('EMAIL_EXISTS')) {
				throw new BadRequestException('Email already registered');
			}

			if (
				errorMessage.includes('INVALID_LOGIN_CREDENTIALS') ||
				errorMessage.includes('INVALID_PASSWORD') ||
				errorMessage.includes('EMAIL_NOT_FOUND')
			) {
				throw new UnauthorizedException('Invalid email or password');
			}

			throw new BadRequestException(errorMessage);
		}

		return body;
	}
}
