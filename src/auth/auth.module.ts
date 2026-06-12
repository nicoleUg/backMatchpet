import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LegacyAuthController } from './legacy-auth.controller';

@Module({
  imports: [UsersModule],
  controllers: [AuthController, LegacyAuthController],
  providers: [AuthService],
})
export class AuthModule {}
