import { PetsRepository } from '../pets/pets.repository';
import { UsersRepository } from '../users/users.repository';
import { Pet } from '../pets/interfaces/pet.interface';
export declare class MatchesService {
    private readonly petsRepository;
    private readonly usersRepository;
    constructor(petsRepository: PetsRepository, usersRepository: UsersRepository);
    likePet(userId: string, petId: string): Promise<{
        success: boolean;
        petId: string;
        matches: string[];
        matchesCount: number;
    }>;
    listMatchesForUser(userId: string): Promise<Pet[]>;
}
