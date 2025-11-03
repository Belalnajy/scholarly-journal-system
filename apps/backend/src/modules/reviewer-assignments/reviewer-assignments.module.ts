import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewerAssignmentsService } from './reviewer-assignments.service';
import { ReviewerAssignmentsController } from './reviewer-assignments.controller';
import { ReviewerAssignment } from '../../database/entities/reviewer-assignment.entity';
import { Research } from '../../database/entities/research.entity';
import { User } from '../../database/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewerAssignment, Research, User]),
    NotificationsModule,
    EmailModule,
  ],
  controllers: [ReviewerAssignmentsController],
  providers: [ReviewerAssignmentsService],
  exports: [ReviewerAssignmentsService],
})
export class ReviewerAssignmentsModule {}
