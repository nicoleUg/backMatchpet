import { MatchesService } from './matches.service';
import type { CurrentUser } from '../common/interfaces/current-user.interface';
export declare class MatchesController {
    private readonly matchesService;
    constructor(matchesService: MatchesService);
    getMyMatches(user: CurrentUser): Promise<import("../pets/interfaces/pet.interface").Pet[]>;
}
