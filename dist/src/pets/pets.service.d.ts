import { PetsRepository } from './pets.repository';
import { CreatePetDto } from './dto/create-pet.dto';
import { QueryPetsDto } from './dto/query-pets.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet } from './interfaces/pet.interface';
export declare class PetsService {
    private readonly petsRepository;
    constructor(petsRepository: PetsRepository);
    create(ownerId: string, dto: CreatePetDto): Promise<Pet>;
    findAll(query: QueryPetsDto): Promise<Pet[]>;
    findOne(id: string): Promise<Pet>;
    update(ownerId: string, petId: string, dto: UpdatePetDto): Promise<Pet>;
    remove(ownerId: string, petId: string): Promise<{
        success: boolean;
        deletedId: string;
    }>;
}
