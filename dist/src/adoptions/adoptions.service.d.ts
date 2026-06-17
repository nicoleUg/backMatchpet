import { PetsRepository } from '../pets/pets.repository';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { Pet } from '../pets/interfaces/pet.interface';
export declare class AdoptionsService {
    private readonly petsRepository;
    private readonly usersRepository;
    private readonly usersService;
    constructor(petsRepository: PetsRepository, usersRepository: UsersRepository, usersService: UsersService);
    adoptPet(userId: string, petId: string): Promise<Pet>;
    listAdoptionsForUser(userId: string): Promise<Pet[]>;
}
