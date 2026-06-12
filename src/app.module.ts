import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PetsModule } from './pets/pets.module';
import { MatchesModule } from './matches/matches.module';
import { AdoptionsModule } from './adoptions/adoptions.module';

@Module({
  imports: [
    CommonModule,
    FirebaseModule,
    AuthModule,
    UsersModule,
    PetsModule,
    MatchesModule,
    AdoptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
