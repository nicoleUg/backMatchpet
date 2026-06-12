import { AuthService } from './auth.service';
import { LegacyRegisterDto } from './dto/legacy-register.dto';
import { LegacyLoginDto } from './dto/legacy-login.dto';
export declare class LegacyAuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: LegacyRegisterDto): Promise<{
        user: import("../users/interfaces/user.interface").UserProfile;
        tokens: {
            idToken: unknown;
            refreshToken: unknown;
            expiresIn: unknown;
        };
    }>;
    login(dto: LegacyLoginDto): Promise<{
        user: import("../users/interfaces/user.interface").UserProfile;
        tokens: {
            idToken: unknown;
            refreshToken: unknown;
            expiresIn: unknown;
        };
    }>;
    sessions(limit?: string): Promise<{
        totalActiveSessions: number;
        sessions: {
            id: string;
        }[];
        timestamp: string;
    }>;
}
