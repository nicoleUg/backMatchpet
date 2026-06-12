import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'MatchPet API',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
