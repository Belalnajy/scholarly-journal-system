import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { User } from '../../database/entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  /**
   * Create a new notification
   * إنشاء إشعار جديد
   */
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  /**
   * Find all notifications with optional filters
   * البحث عن جميع الإشعارات مع إمكانية التصفية
   */
  async findAll(filters?: {
    user_id?: string;
    is_read?: boolean;
    type?: string;
  }): Promise<Notification[]> {
    const query = this.notificationRepository.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .orderBy('notification.created_at', 'DESC');

    if (filters?.user_id) {
      query.andWhere('notification.user_id = :user_id', { user_id: filters.user_id });
    }

    if (filters?.is_read !== undefined) {
      query.andWhere('notification.is_read = :is_read', { is_read: filters.is_read });
    }

    if (filters?.type) {
      query.andWhere('notification.type = :type', { type: filters.type });
    }

    return await query.getMany();
  }

  /**
   * Find one notification by ID
   * البحث عن إشعار واحد بواسطة المعرف
   */
  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException('الإشعار غير موجود');
    }

    return notification;
  }

  /**
   * Get notifications by user
   * الحصول على إشعارات مستخدم معين
   */
  async findByUser(userId: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get unread notifications count for a user
   * الحصول على عدد الإشعارات غير المقروءة لمستخدم
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    });
  }

  /**
   * Mark notification as read
   * تحديد الإشعار كمقروء
   */
  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.is_read = true;
    notification.read_at = new Date();
    return await this.notificationRepository.save(notification);
  }

  /**
   * Mark all notifications as read for a user
   * تحديد جميع الإشعارات كمقروءة لمستخدم
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ is_read: true, read_at: new Date() })
      .where('user_id = :userId AND is_read = false', { userId })
      .execute();
  }

  /**
   * Update notification
   * تحديث الإشعار
   */
  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    Object.assign(notification, updateNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  /**
   * Remove notification
   * حذف الإشعار
   */
  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  /**
   * Remove all read notifications for a user
   * حذف جميع الإشعارات المقروءة لمستخدم
   */
  async removeAllRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('user_id = :userId AND is_read = true', { userId })
      .execute();
  }

  /**
   * Broadcast notification to all users
   * إرسال إشعار لجميع المستخدمين
   */
  async broadcastToAll(broadcastDto: BroadcastNotificationDto): Promise<{ count: number }> {
    // Get all users
    const users = await this.userRepository.find({
      select: ['id']
    });

    // Create notifications for all users
    const notifications = users.map(user => 
      this.notificationRepository.create({
        user_id: user.id,
        type: broadcastDto.type,
        title: broadcastDto.title,
        message: broadcastDto.message,
        action_url: broadcastDto.action_url,
      })
    );

    // Save all notifications
    await this.notificationRepository.save(notifications);

    return { count: notifications.length };
  }

  /**
   * Helper: Create notification for research submission
   * إنشاء إشعار عند إرسال بحث جديد
   */
  async notifyResearchSubmitted(researchId: string, researchTitle: string, researcherId: string): Promise<void> {
    // Notify all editors and admins
    const editorsAndAdmins = await this.userRepository.find({
      where: [
        { role: 'editor' },
        { role: 'admin' }
      ]
    });

    const notifications = editorsAndAdmins.map(user =>
      this.notificationRepository.create({
        user_id: user.id,
        type: 'research_submitted',
        title: 'بحث جديد تم إرساله',
        message: `تم إرسال بحث جديد: ${researchTitle}`,
        research_id: researchId,
        link: `/dashboard/manage-research`,
      })
    );

    await this.notificationRepository.save(notifications);
  }

  /**
   * Helper: Create notification for reviewer assignment
   * إنشاء إشعار عند تعيين محكم
   */
  async notifyReviewerAssigned(researchId: string, researchTitle: string, reviewerId: string): Promise<void> {
    const notification = this.notificationRepository.create({
      user_id: reviewerId,
      type: 'reviewer_assigned',
      title: 'تم تعيينك كمحكم',
      message: `تم تعيينك لمراجعة بحث: ${researchTitle}`,
      research_id: researchId,
      link: `/dashboard/my-tasks`,
    });

    await this.notificationRepository.save(notification);
  }

  /**
   * Helper: Create notification for review submission
   * إنشاء إشعار عند إرسال تقييم
   */
  async notifyReviewSubmitted(researchId: string, researchTitle: string, researcherId: string): Promise<void> {
    // Notify researcher
    const researcherNotification = this.notificationRepository.create({
      user_id: researcherId,
      type: 'review_submitted',
      title: 'تم استلام تقييم جديد',
      message: `تم استلام تقييم لبحثك: ${researchTitle}`,
      research_id: researchId,
      link: `/dashboard/view-research/${researchId}`,
    });

    // Notify editors and admins
    const editorsAndAdmins = await this.userRepository.find({
      where: [
        { role: 'editor' },
        { role: 'admin' }
      ]
    });

    const editorNotifications = editorsAndAdmins.map(user =>
      this.notificationRepository.create({
        user_id: user.id,
        type: 'review_submitted',
        title: 'تقييم جديد تم إرساله',
        message: `تم إرسال تقييم جديد للبحث: ${researchTitle}`,
        research_id: researchId,
        link: `/dashboard/editor-review-details/${researchId}`,
      })
    );

    await this.notificationRepository.save([researcherNotification, ...editorNotifications]);
  }

  /**
   * Helper: Create notification for revision request
   * إنشاء إشعار عند طلب تعديلات
   */
  async notifyRevisionRequested(researchId: string, researchTitle: string, researcherId: string): Promise<void> {
    const notification = this.notificationRepository.create({
      user_id: researcherId,
      type: 'revision_requested',
      title: 'مطلوب تعديلات على بحثك',
      message: `يرجى إجراء تعديلات على بحثك: ${researchTitle}`,
      research_id: researchId,
      link: `/dashboard/revise-research/${researchId}`,
    });

    await this.notificationRepository.save(notification);
  }

  /**
   * Helper: Create notification for revision submission
   * إنشاء إشعار عند إرسال تعديلات
   */
  async notifyRevisionSubmitted(researchId: string, researchTitle: string, reviewerIds: string[]): Promise<void> {
    // Notify all assigned reviewers
    const notifications = reviewerIds.map(reviewerId =>
      this.notificationRepository.create({
        user_id: reviewerId,
        type: 'revision_submitted',
        title: 'تم إرسال نسخة معدلة',
        message: `تم إرسال نسخة معدلة من البحث: ${researchTitle}`,
        research_id: researchId,
        link: `/dashboard/reviewer-research-view/${researchId}`,
      })
    );

    // Notify editors and admins
    const editorsAndAdmins = await this.userRepository.find({
      where: [
        { role: 'editor' },
        { role: 'admin' }
      ]
    });

    const editorNotifications = editorsAndAdmins.map(user =>
      this.notificationRepository.create({
        user_id: user.id,
        type: 'revision_submitted',
        title: 'نسخة معدلة تم إرسالها',
        message: `تم إرسال نسخة معدلة من البحث: ${researchTitle}`,
        research_id: researchId,
        link: `/dashboard/editor-review-details/${researchId}`,
      })
    );

    await this.notificationRepository.save([...notifications, ...editorNotifications]);
  }

  /**
   * Helper: Create notification for research acceptance
   * إنشاء إشعار عند قبول بحث
   */
  async notifyResearchAccepted(researchId: string, researchTitle: string, researcherId: string): Promise<void> {
    const notification = this.notificationRepository.create({
      user_id: researcherId,
      type: 'research_accepted',
      title: '🎉 تم قبول بحثك!',
      message: `تهانينا! تم قبول بحثك: ${researchTitle}`,
      research_id: researchId,
      link: `/dashboard/view-research/${researchId}`,
    });

    await this.notificationRepository.save(notification);
  }

  /**
   * Helper: Create notification for research rejection
   * إنشاء إشعار عند رفض بحث
   */
  async notifyResearchRejected(researchId: string, researchTitle: string, researcherId: string): Promise<void> {
    const notification = this.notificationRepository.create({
      user_id: researcherId,
      type: 'research_rejected',
      title: 'قرار بخصوص بحثك',
      message: `نأسف لإبلاغك بأن بحثك: ${researchTitle} لم يتم قبوله`,
      research_id: researchId,
      link: `/dashboard/view-research/${researchId}`,
    });

    await this.notificationRepository.save(notification);
  }

  /**
   * Helper: Create notification for research publication
   * إنشاء إشعار عند نشر بحث
   */
  async notifyResearchPublished(researchId: string, researchTitle: string, researcherId: string): Promise<void> {
    const notification = this.notificationRepository.create({
      user_id: researcherId,
      type: 'research_published',
      title: '🎊 تم نشر بحثك!',
      message: `تم نشر بحثك: ${researchTitle} في المجلة`,
      research_id: researchId,
      link: `/dashboard/view-research/${researchId}`,
    });

    await this.notificationRepository.save(notification);
  }
}
