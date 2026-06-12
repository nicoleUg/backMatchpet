import { FirebaseService } from '../firebase/firebase/firebase.service';
import { UserProfile, UserProfileStats } from './interfaces/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { Pet } from '../pets/interfaces/pet.interface';
interface EnsureUserParams {
    uid: string;
    email: string;
    fullName?: string;
    displayName?: string;
}
export declare class UsersService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    ensureUserDocument(params: EnsureUserParams): Promise<UserProfile>;
    getById(id: string): Promise<UserProfile>;
    findByUsername(username: string): Promise<UserProfile | null>;
    updateMe(uid: string, dto: UpdateUserDto): Promise<UserProfile>;
    getProfile(id: string): Promise<UserProfileStats>;
    getMatches(id: string): Promise<Pet[]>;
    getAdoptions(id: string): Promise<Pet[]>;
    removePetFromAllMatches(petId: string): Promise<void>;
    private getPetsByIds;
    private mapUser;
    private mapPet;
}
export {};
