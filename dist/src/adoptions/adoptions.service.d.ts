import { FirebaseService } from '../firebase/firebase/firebase.service';
import { Pet } from '../pets/interfaces/pet.interface';
import { UsersService } from '../users/users.service';
export declare class AdoptionsService {
    private readonly firebaseService;
    private readonly usersService;
    constructor(firebaseService: FirebaseService, usersService: UsersService);
    adoptPet(userId: string, petId: string): Promise<Pet>;
    listAdoptionsForUser(userId: string): Promise<Pet[]>;
    private mapPet;
}
