import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResearchRevision } from '../../database/entities/research-revision.entity';
import { Research } from '../../database/entities/research.entity';
import { ReviewerAssignment } from '../../database/entities/reviewer-assignment.entity';
import { ResearchRevisionsService } from './research-revisions.service';
import { ResearchRevisionsController } from './research-revisions.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResearchRevision, Research, ReviewerAssignment]),
    NotificationsModule,
  ],
  controllers: [ResearchRevisionsController],
  providers: [ResearchRevisionsService],
  exports: [ResearchRevisionsService],
})
export class ResearchRevisionsModule {}
