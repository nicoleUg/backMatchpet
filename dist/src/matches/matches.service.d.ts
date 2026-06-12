import { FirebaseService } from '../firebase/firebase/firebase.service';
import { Pet } from '../pets/interfaces/pet.interface';
export declare class MatchesService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    likePet(userId: string, petId: string): Promise<{
        success: boolean;
        petId: string;
        matches: string[];
        matchesCount: number;
    }>;
    listMatchesForUser(userId: string): Promise<Pet[]>;
    private mapPet;
}
