import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { QueryPetsDto } from './dto/query-pets.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import type { CurrentUser } from '../common/interfaces/current-user.interface';
import { MatchesService } from '../matches/matches.service';
import { AdoptionsService } from '../adoptions/adoptions.service';
export declare class PetsController {
    private readonly petsService;
    private readonly matchesService;
    private readonly adoptionsService;
    constructor(petsService: PetsService, matchesService: MatchesService, adoptionsService: AdoptionsService);
    create(user: CurrentUser, dto: CreatePetDto): Promise<import("./interfaces/pet.interface").Pet>;
    findAll(query: QueryPetsDto): Promise<import("./interfaces/pet.interface").Pet[]>;
    like(user: CurrentUser, petId: string): Promise<{
        success: boolean;
        petId: string;
        matches: string[];
        matchesCount: number;
    }>;
    adopt(user: CurrentUser, petId: string): Promise<import("./interfaces/pet.interface").Pet>;
    findOne(id: string): Promise<import("./interfaces/pet.interface").Pet>;
    update(user: CurrentUser, id: string, dto: UpdatePetDto): Promise<import("./interfaces/pet.interface").Pet>;
    remove(user: CurrentUser, id: string): Promise<{
        success: boolean;
        deletedId: string;
    }>;
}
