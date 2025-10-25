import { Injectable, NotFoundException, ConflictException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review, ReviewStatus } from '../../database/entities/review.entity';
import { ResearchService } from '../research/research.service';
import { ReviewerAssignmentsService } from '../reviewer-assignments/reviewer-assignments.service';
import { ResearchStatus } from '../../database/entities/research.entity';
import { ReviewerAssignmentStatus } from '../../database/entities/reviewer-assignment.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @Inject(forwardRef(() => ResearchService))
    private readonly researchService: ResearchService,
    @Inject(forwardRef(() => ReviewerAssignmentsService))
    private readonly reviewerAssignmentsService: ReviewerAssignmentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createDto: CreateReviewDto): Promise<Review> {
    // Check if reviewer already reviewed this research
    const existing = await this.reviewRepository.findOne({
      where: {
        research_id: createDto.research_id,
        reviewer_id: createDto.reviewer_id,
      },
    });

    if (existing) {
      throw new ConflictException('هذا المحكم قام بمراجعة هذا البحث بالفعل');
    }

    const review = this.reviewRepository.create({
      ...createDto,
      submitted_at: new Date(),
      status: ReviewStatus.COMPLETED,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update reviewer assignment status to completed
    await this.updateReviewerAssignmentStatus(createDto.research_id, createDto.reviewer_id);

    // Check if all assigned reviewers have submitted their reviews
    await this.checkAndUpdateResearchStatus(createDto.research_id);

    // Send notification about review submission
    try {
      const research = await this.researchService.findOne(createDto.research_id);
      await this.notificationsService.notifyReviewSubmitted(
        research.id,
        research.title,
        research.user_id,
      );
    } catch (error) {
      console.error('Failed to send review submission notification:', error);
    }

    return savedReview;
  }

  /**
   * Update reviewer assignment status to completed
   */
  private async updateReviewerAssignmentStatus(research_id: string, reviewer_id: string): Promise<void> {
    try {
      const assignments = await this.reviewerAssignmentsService.findAll({ research_id, reviewer_id });
      
      if (assignments.length > 0) {
        const assignment = assignments[0];
        await this.reviewerAssignmentsService.updateStatus(assignment.id, ReviewerAssignmentStatus.COMPLETED);
      }
    } catch (error) {
      // Log error but don't fail the review creation
      console.error('Failed to update reviewer assignment status:', error);
    }
  }

  /**
   * Check if all assigned reviewers have submitted their reviews
   * If yes, update research status to PENDING_EDITOR_DECISION
   */
  private async checkAndUpdateResearchStatus(research_id: string): Promise<void> {
    // Get all reviewer assignments for this research
    const assignments = await this.reviewerAssignmentsService.findAll({ research_id });
    
    if (assignments.length === 0) {
      return; // No reviewers assigned
    }

    // Get all completed reviews for this research
    const reviews = await this.findAll({ research_id, status: ReviewStatus.COMPLETED });

    // Check if the number of completed reviews equals the number of assignments
    if (reviews.length >= assignments.length) {
      // All reviewers have submitted their reviews
      const research = await this.researchService.findOne(research_id);
      
      // Only update if currently under review
      if (research.status === ResearchStatus.UNDER_REVIEW) {
        await this.researchService.updateStatus(research_id, ResearchStatus.PENDING_EDITOR_DECISION);
      }
    }
  }

  async findAll(filters?: {
    research_id?: string;
    reviewer_id?: string;
    status?: ReviewStatus;
  }): Promise<Review[]> {
    const query = this.reviewRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .leftJoinAndSelect('review.research', 'research');

    if (filters?.research_id) {
      query.andWhere('review.research_id = :research_id', {
        research_id: filters.research_id,
      });
    }

    if (filters?.reviewer_id) {
      query.andWhere('review.reviewer_id = :reviewer_id', {
        reviewer_id: filters.reviewer_id,
      });
    }

    if (filters?.status) {
      query.andWhere('review.status = :status', { status: filters.status });
    }

    query.orderBy('review.created_at', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['research', 'reviewer'],
    });

    if (!review) {
      throw new NotFoundException('المراجعة غير موجودة');
    }

    return review;
  }

  async update(id: string, updateDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);

    Object.assign(review, updateDto);

    const savedReview = await this.reviewRepository.save(review);

    // If review is being marked as completed, check if all reviews are done
    if (updateDto.status === ReviewStatus.COMPLETED) {
      await this.updateReviewerAssignmentStatus(review.research_id, review.reviewer_id);
      await this.checkAndUpdateResearchStatus(review.research_id);
    }

    return savedReview;
  }

  async updateStatus(id: string, status: ReviewStatus): Promise<Review> {
    const review = await this.findOne(id);
    review.status = status;
    
    if (status === ReviewStatus.COMPLETED && !review.submitted_at) {
      review.submitted_at = new Date();
    }

    return await this.reviewRepository.save(review);
  }

  async remove(id: string): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewRepository.remove(review);
  }

  async getResearchReviewsStats(research_id: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    average_rating: number;
  }> {
    const reviews = await this.findAll({ research_id });
    const completedReviews = reviews.filter((r) => r.status === ReviewStatus.COMPLETED);

    const totalRating = completedReviews.reduce((sum, r) => sum + (r.average_rating || 0), 0);
    const avgRating = completedReviews.length > 0 ? totalRating / completedReviews.length : 0;

    return {
      total: reviews.length,
      completed: completedReviews.length,
      pending: reviews.filter((r) => r.status === ReviewStatus.PENDING).length,
      average_rating: Math.round(avgRating * 100) / 100,
    };
  }
}
