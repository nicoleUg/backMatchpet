import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getRoot(): {
        service: string;
        status: string;
        timestamp: string;
    };
    getHealth(): {
        service: string;
        status: string;
        timestamp: string;
    };
}
