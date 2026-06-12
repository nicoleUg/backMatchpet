import { UsersService } from './users.service';
import type { CurrentUser } from '../common/interfaces/current-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getById(id: string): Promise<import("./interfaces/user.interface").UserProfile>;
    getProfile(id: string): Promise<import("./interfaces/user.interface").UserProfileStats>;
    getMatches(id: string): Promise<import("../pets/interfaces/pet.interface").Pet[]>;
    getAdoptions(id: string): Promise<import("../pets/interfaces/pet.interface").Pet[]>;
    patchMe(user: CurrentUser, dto: UpdateUserDto): Promise<import("./interfaces/user.interface").UserProfile>;
}
