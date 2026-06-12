import { PetStatus } from '../interfaces/pet.interface';
export declare class QueryPetsDto {
    species?: string;
    status?: PetStatus;
    ownerId?: string;
    name?: string;
    breed?: string;
    gender?: string;
    minAge?: number;
    maxAge?: number;
}
