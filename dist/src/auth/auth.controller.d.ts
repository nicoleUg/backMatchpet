import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { CurrentUser } from '../common/interfaces/current-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    me(user: CurrentUser): Promise<import("../users/interfaces/user.interface").UserProfile>;
    logout(user: CurrentUser): Promise<{
        success: boolean;
        message: string;
    }>;
}
