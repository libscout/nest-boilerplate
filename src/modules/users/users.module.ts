import { Module } from '@nestjs/common';
import { DbModule } from '@src/tools/db';
import { User } from './entities';
import {
  UserLookupService,
  UserRegistrationService,
  UserPasswordResetService,
} from './services';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [DbModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UserLookupService,
    UserRegistrationService,
    UserPasswordResetService,
  ],
  exports: [UserLookupService, UserRegistrationService],
})
export class UsersModule {}
