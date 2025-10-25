import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../../database/entities/activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>
  ) {}

  /**
   * Create a new activity log
   * إنشاء سجل نشاط جديد
   */
  async create(createActivityLogDto: CreateActivityLogDto): Promise<ActivityLog> {
    const activityLog = this.activityLogRepository.create(createActivityLogDto);
    return await this.activityLogRepository.save(activityLog);
  }

  /**
   * Find all activity logs with optional filters
   * البحث عن جميع سجلات النشاط مع إمكانية التصفية
   */
  async findAll(filters?: {
    user_id?: string;
    research_id?: string;
    action_type?: string;
    limit?: number;
  }): Promise<ActivityLog[]> {
    const query = this.activityLogRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.created_at', 'DESC');

    if (filters?.user_id) {
      query.andWhere('log.user_id = :user_id', { user_id: filters.user_id });
    }

    if (filters?.research_id) {
      query.andWhere('log.research_id = :research_id', { research_id: filters.research_id });
    }

    if (filters?.action_type) {
      query.andWhere('log.action_type = :action_type', { action_type: filters.action_type });
    }

    if (filters?.limit) {
      query.take(filters.limit);
    }

    return await query.getMany();
  }

  /**
   * Find one activity log by ID
   * البحث عن سجل نشاط واحد بواسطة المعرف
   */
  async findOne(id: string): Promise<ActivityLog> {
    const activityLog = await this.activityLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!activityLog) {
      throw new NotFoundException('سجل النشاط غير موجود');
    }

    return activityLog;
  }

  /**
   * Get activity logs by user
   * الحصول على سجلات النشاط الخاصة بمستخدم معين
   */
  async findByUser(userId: string, limit = 50): Promise<ActivityLog[]> {
    return await this.activityLogRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get activity logs by research
   * الحصول على سجلات النشاط الخاصة ببحث معين
   */
  async findByResearch(researchId: string): Promise<ActivityLog[]> {
    return await this.activityLogRepository.find({
      where: { research_id: researchId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get activity statistics
   * الحصول على إحصائيات النشاط
   */
  async getStats() {
    const total = await this.activityLogRepository.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await this.activityLogRepository
      .createQueryBuilder('log')
      .where('log.created_at >= :today', { today })
      .getCount();

    return {
      total,
      today: todayCount,
    };
  }

  /**
   * Update is not typically needed for activity logs
   * التحديث غير مطلوب عادة لسجلات النشاط
   */
  async update(id: string, updateActivityLogDto: UpdateActivityLogDto): Promise<ActivityLog> {
    const activityLog = await this.findOne(id);
    Object.assign(activityLog, updateActivityLogDto);
    return await this.activityLogRepository.save(activityLog);
  }

  /**
   * Remove activity log (soft delete recommended)
   * حذف سجل النشاط (يُفضل الحذف الناعم)
   */
  async remove(id: string): Promise<void> {
    const activityLog = await this.findOne(id);
    await this.activityLogRepository.remove(activityLog);
  }
}
