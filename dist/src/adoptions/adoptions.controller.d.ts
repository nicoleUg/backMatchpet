import { AdoptionsService } from './adoptions.service';
import type { CurrentUser } from '../common/interfaces/current-user.interface';
export declare class AdoptionsController {
    private readonly adoptionsService;
    constructor(adoptionsService: AdoptionsService);
    getMyAdoptions(user: CurrentUser): Promise<import("../pets/interfaces/pet.interface").Pet[]>;
}
