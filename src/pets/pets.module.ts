import { Module } from '@nestjs/common';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { MatchesModule } from '../matches/matches.module';
import { AdoptionsModule } from '../adoptions/adoptions.module';

@Module({
  imports: [MatchesModule, AdoptionsModule],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}
