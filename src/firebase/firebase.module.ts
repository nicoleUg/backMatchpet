import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase/firebase.service';
import { PetsRepository } from '../pets/pets.repository';
import { UsersRepository } from '../users/users.repository';

@Global()
@Module({
  providers: [FirebaseService, PetsRepository, UsersRepository],
  exports: [FirebaseService, PetsRepository, UsersRepository],
})
export class FirebaseModule {}
