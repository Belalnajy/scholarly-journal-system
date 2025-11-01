import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from '../../database/entities/review.entity';
import { Research } from '../../database/entities/research.entity';
import { User } from '../../database/entities/user.entity';
import { ResearchModule } from '../research/research.module';
import { ReviewerAssignmentsModule } from '../reviewer-assignments/reviewer-assignments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Research, User]),
    forwardRef(() => ResearchModule),
    forwardRef(() => ReviewerAssignmentsModule),
    NotificationsModule,
    CloudinaryModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
