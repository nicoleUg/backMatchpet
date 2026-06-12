import { Module } from '@nestjs/common';
import { AdoptionsController } from './adoptions.controller';
import { AdoptionsService } from './adoptions.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AdoptionsController],
  providers: [AdoptionsService],
  exports: [AdoptionsService],
})
export class AdoptionsModule {}
