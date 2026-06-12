export interface UserProfile {
    id: string;
    fullName: string;
    displayName: string;
    email: string;
    matches: string[];
    adoptions: string[];
    phone: string;
    location: string;
    bio: string;
    createdAt: string;
    updatedAt: string;
}
export interface UserProfileStats extends UserProfile {
    publishedPetsCount: number;
    matchesCount: number;
    adoptionsCount: number;
}
