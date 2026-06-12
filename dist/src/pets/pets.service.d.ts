import { FirebaseService } from '../firebase/firebase/firebase.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { QueryPetsDto } from './dto/query-pets.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet } from './interfaces/pet.interface';
import { MatchesService } from '../matches/matches.service';
import { AdoptionsService } from '../adoptions/adoptions.service';
export declare class PetsService {
    private readonly firebaseService;
    private readonly matchesService;
    private readonly adoptionsService;
    constructor(firebaseService: FirebaseService, matchesService: MatchesService, adoptionsService: AdoptionsService);
    create(ownerId: string, dto: CreatePetDto): Promise<Pet>;
    findAll(query: QueryPetsDto): Promise<Pet[]>;
    findOne(id: string): Promise<Pet>;
    update(ownerId: string, petId: string, dto: UpdatePetDto): Promise<Pet>;
    remove(ownerId: string, petId: string): Promise<{
        success: boolean;
        deletedId: string;
    }>;
    likePet(userId: string, petId: string): Promise<{
        success: boolean;
        petId: string;
        matches: string[];
        matchesCount: number;
    }>;
    adoptPet(userId: string, petId: string): Promise<Pet>;
    private mapPet;
}
