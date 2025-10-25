import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewerAssignmentDto } from './dto/create-reviewer-assignment.dto';
import { UpdateReviewerAssignmentDto } from './dto/update-reviewer-assignment.dto';
import { ReviewerAssignment, ReviewerAssignmentStatus } from '../../database/entities/reviewer-assignment.entity';
import { Research } from '../../database/entities/research.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewerAssignmentsService {
  constructor(
    @InjectRepository(ReviewerAssignment)
    private readonly reviewerAssignmentRepository: Repository<ReviewerAssignment>,
    @InjectRepository(Research)
    private readonly researchRepository: Repository<Research>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createDto: CreateReviewerAssignmentDto): Promise<ReviewerAssignment> {
    // Check if reviewer is already assigned to this research
    const existing = await this.reviewerAssignmentRepository.findOne({
      where: {
        research_id: createDto.research_id,
        reviewer_id: createDto.reviewer_id,
      },
    });

    if (existing) {
      throw new ConflictException('هذا المحكم مُعيَّن بالفعل لهذا البحث');
    }

    const assignment = this.reviewerAssignmentRepository.create(createDto);
    const savedAssignment = await this.reviewerAssignmentRepository.save(assignment);

    // Get research details for notification
    try {
      const research = await this.researchRepository.findOne({
        where: { id: createDto.research_id },
      });

      if (research) {
        await this.notificationsService.notifyReviewerAssigned(
          research.id,
          research.title,
          createDto.reviewer_id,
        );
      }
    } catch (error) {
      console.error('Failed to send reviewer assignment notification:', error);
    }

    return savedAssignment;
  }

  async findAll(filters?: {
    research_id?: string;
    reviewer_id?: string;
    status?: ReviewerAssignmentStatus;
  }): Promise<ReviewerAssignment[]> {
    const query = this.reviewerAssignmentRepository.createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.reviewer', 'reviewer')
      .leftJoinAndSelect('assignment.research', 'research')
      .leftJoinAndSelect('assignment.assigner', 'assigner');

    if (filters?.research_id) {
      query.andWhere('assignment.research_id = :research_id', {
        research_id: filters.research_id,
      });
    }

    if (filters?.reviewer_id) {
      query.andWhere('assignment.reviewer_id = :reviewer_id', {
        reviewer_id: filters.reviewer_id,
      });
    }

    if (filters?.status) {
      query.andWhere('assignment.status = :status', { status: filters.status });
    }

    query.orderBy('assignment.created_at', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<ReviewerAssignment> {
    const assignment = await this.reviewerAssignmentRepository.findOne({
      where: { id },
      relations: ['research', 'reviewer', 'assigner'],
    });

    if (!assignment) {
      throw new NotFoundException('التعيين غير موجود');
    }

    return assignment;
  }

  async update(id: string, updateDto: UpdateReviewerAssignmentDto): Promise<ReviewerAssignment> {
    const assignment = await this.findOne(id);

    Object.assign(assignment, updateDto);

    return await this.reviewerAssignmentRepository.save(assignment);
  }

  async updateStatus(id: string, status: ReviewerAssignmentStatus): Promise<ReviewerAssignment> {
    const assignment = await this.findOne(id);
    assignment.status = status;
    return await this.reviewerAssignmentRepository.save(assignment);
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.findOne(id);
    await this.reviewerAssignmentRepository.remove(assignment);
  }

  async getReviewerStats(reviewer_id: string): Promise<{
    total: number;
    assigned: number;
    accepted: number;
    completed: number;
  }> {
    const assignments = await this.findAll({ reviewer_id });

    return {
      total: assignments.length,
      assigned: assignments.filter((a) => a.status === ReviewerAssignmentStatus.ASSIGNED).length,
      accepted: assignments.filter((a) => a.status === ReviewerAssignmentStatus.ACCEPTED).length,
      completed: assignments.filter((a) => a.status === ReviewerAssignmentStatus.COMPLETED).length,
    };
  }
}
