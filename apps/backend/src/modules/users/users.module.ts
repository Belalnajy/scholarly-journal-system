import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../../database/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    NotificationsModule, // Import NotificationsModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export for use in other modules
})
export class UsersModule {}
