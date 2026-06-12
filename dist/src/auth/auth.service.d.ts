import { FirebaseService } from '../firebase/firebase/firebase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly firebaseService;
    private readonly usersService;
    constructor(firebaseService: FirebaseService, usersService: UsersService);
    register(dto: RegisterDto): Promise<{
        user: import("../users/interfaces/user.interface").UserProfile;
        tokens: {
            idToken: unknown;
            refreshToken: unknown;
            expiresIn: unknown;
        };
    }>;
    login(dto: LoginDto): Promise<{
        user: import("../users/interfaces/user.interface").UserProfile;
        tokens: {
            idToken: unknown;
            refreshToken: unknown;
            expiresIn: unknown;
        };
    }>;
    loginByUsername(username: string, password: string): Promise<{
        user: import("../users/interfaces/user.interface").UserProfile;
        tokens: {
            idToken: unknown;
            refreshToken: unknown;
            expiresIn: unknown;
        };
    }>;
    getMe(uid: string): Promise<import("../users/interfaces/user.interface").UserProfile>;
    logout(uid: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getActiveSessions(limit?: number): Promise<{
        totalActiveSessions: number;
        sessions: {
            id: string;
        }[];
        timestamp: string;
    }>;
    private createSession;
    private deactivateSessions;
    private firebaseIdentityRequest;
}
