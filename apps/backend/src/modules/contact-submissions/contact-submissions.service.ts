import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSubmission, ContactSubmissionStatus } from '../../database/entities/contact-submission.entity';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';
import { UpdateContactSubmissionDto } from './dto/update-contact-submission.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { NotificationType } from '../../database/entities/notification.entity';

@Injectable()
export class ContactSubmissionsService {
  constructor(
    @InjectRepository(ContactSubmission)
    private readonly contactSubmissionRepository: Repository<ContactSubmission>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create a new contact submission
   * إنشاء رسالة تواصل جديدة
   */
  async create(createContactSubmissionDto: CreateContactSubmissionDto): Promise<ContactSubmission> {
    const submission = this.contactSubmissionRepository.create(createContactSubmissionDto);
    const savedSubmission = await this.contactSubmissionRepository.save(submission);

    // Send notification to all admins about new contact submission
    try {
      const allUsers = await this.usersService.findAll();
      const admins = allUsers.filter(user => user.role === 'admin');

      for (const admin of admins) {
        await this.notificationsService.create({
          user_id: admin.id,
          type: NotificationType.GENERAL,
          title: 'رسالة تواصل جديدة',
          message: `تم استلام رسالة تواصل جديدة من ${createContactSubmissionDto.name} بخصوص: ${createContactSubmissionDto.subject}`,
          action_url: `/dashboard/manage-contact-submissions`,
        });
      }
    } catch (error) {
      console.error('Failed to send contact submission notification:', error);
    }

    return savedSubmission;
  }

  /**
   * Find all contact submissions with optional filters
   * البحث عن جميع رسائل التواصل مع إمكانية التصفية
   */
  async findAll(filters?: {
    status?: ContactSubmissionStatus;
    user_id?: string;
  }): Promise<ContactSubmission[]> {
    const query = this.contactSubmissionRepository.createQueryBuilder('submission')
      .leftJoinAndSelect('submission.user', 'user')
      .orderBy('submission.submitted_at', 'DESC');

    if (filters?.status) {
      query.andWhere('submission.status = :status', { status: filters.status });
    }

    if (filters?.user_id) {
      query.andWhere('submission.user_id = :user_id', { user_id: filters.user_id });
    }

    return await query.getMany();
  }

  /**
   * Find one contact submission by ID
   * البحث عن رسالة تواصل واحدة بواسطة المعرف
   */
  async findOne(id: string): Promise<ContactSubmission> {
    const submission = await this.contactSubmissionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!submission) {
      throw new NotFoundException('رسالة التواصل غير موجودة');
    }

    return submission;
  }

  /**
   * Get submissions by user
   * الحصول على رسائل التواصل الخاصة بمستخدم معين
   */
  async findByUser(userId: string): Promise<ContactSubmission[]> {
    return await this.contactSubmissionRepository.find({
      where: { user_id: userId },
      order: { submitted_at: 'DESC' },
    });
  }

  /**
   * Get pending submissions count
   * الحصول على عدد الرسائل قيد الانتظار
   */
  async getPendingCount(): Promise<number> {
    return await this.contactSubmissionRepository.count({
      where: { status: ContactSubmissionStatus.PENDING },
    });
  }

  /**
   * Get submissions statistics
   * الحصول على إحصائيات الرسائل
   */
  async getStats() {
    const total = await this.contactSubmissionRepository.count();
    const pending = await this.contactSubmissionRepository.count({
      where: { status: ContactSubmissionStatus.PENDING },
    });
    const inProgress = await this.contactSubmissionRepository.count({
      where: { status: ContactSubmissionStatus.IN_PROGRESS },
    });
    const resolved = await this.contactSubmissionRepository.count({
      where: { status: ContactSubmissionStatus.RESOLVED },
    });
    const closed = await this.contactSubmissionRepository.count({
      where: { status: ContactSubmissionStatus.CLOSED },
    });

    return {
      total,
      pending,
      inProgress,
      resolved,
      closed,
    };
  }

  /**
   * Update submission status
   * تحديث حالة الرسالة
   */
  async updateStatus(id: string, status: ContactSubmissionStatus): Promise<ContactSubmission> {
    const submission = await this.findOne(id);
    submission.status = status;
    
    if (status === ContactSubmissionStatus.RESOLVED || status === ContactSubmissionStatus.CLOSED) {
      submission.responded_at = new Date();
    }
    
    return await this.contactSubmissionRepository.save(submission);
  }

  /**
   * Update contact submission
   * تحديث رسالة التواصل
   */
  async update(id: string, updateContactSubmissionDto: UpdateContactSubmissionDto): Promise<ContactSubmission> {
    const submission = await this.findOne(id);
    Object.assign(submission, updateContactSubmissionDto);
    return await this.contactSubmissionRepository.save(submission);
  }

  /**
   * Remove contact submission
   * حذف رسالة التواصل
   */
  async remove(id: string): Promise<void> {
    const submission = await this.findOne(id);
    await this.contactSubmissionRepository.remove(submission);
  }
}
