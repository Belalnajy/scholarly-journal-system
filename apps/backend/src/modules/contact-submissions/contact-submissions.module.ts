import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactSubmission } from '../../database/entities/contact-submission.entity';
import { ContactSubmissionsService } from './contact-submissions.service';
import { ContactSubmissionsController } from './contact-submissions.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactSubmission]),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [ContactSubmissionsController],
  providers: [ContactSubmissionsService],
  exports: [ContactSubmissionsService],
})
export class ContactSubmissionsModule {}
