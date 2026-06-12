export declare enum PetStatus {
    AVAILABLE = "available",
    ADOPTED = "adopted"
}
export interface Pet {
    id: string;
    name: string;
    species: string;
    gender: string;
    age: number;
    breed: string;
    personality: string;
    status: PetStatus;
    ownerId: string;
    photoUrl: string | null;
    createdAt: string;
    updatedAt: string;
}
