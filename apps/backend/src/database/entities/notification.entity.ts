import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * Notification Entity
 * يدير الإشعارات المرسلة للمستخدمين
 */

export enum NotificationType {
  // Research Notifications - إشعارات البحث
  RESEARCH_SUBMITTED = 'research_submitted',
  RESEARCH_ACCEPTED = 'research_accepted',
  RESEARCH_REJECTED = 'research_rejected',
  RESEARCH_PUBLISHED = 'research_published',
  RESEARCH_REVISION_REQUIRED = 'research_revision_required',
  REVISION_REQUESTED = 'revision_requested',
  REVISION_SUBMITTED = 'revision_submitted',
  
  // Review Notifications - إشعارات المراجعة
  REVIEWER_ASSIGNED = 'reviewer_assigned',
  REVIEW_ASSIGNED = 'review_assigned',
  REVIEW_SUBMITTED = 'review_submitted',
  REVIEW_REMINDER = 'review_reminder',
  
  // User Notifications - إشعارات المستخدم
  ACCOUNT_CREATED = 'account_created',
  ACCOUNT_APPROVED = 'account_approved',
  ACCOUNT_SUSPENDED = 'account_suspended',
  PASSWORD_CHANGED = 'password_changed',
  
  // System Notifications - إشعارات النظام
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  
  // Other
  GENERAL = 'general',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // User receiving the notification
  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Notification type
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type!: NotificationType;

  // Notification title
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  // Notification message
  @Column({ type: 'text' })
  message!: string;

  // Optional action URL (e.g., link to research, review page)
  @Column({ type: 'varchar', length: 500, nullable: true })
  action_url!: string | null;

  // Read status
  @Column({ type: 'boolean', default: false })
  is_read!: boolean;

  // Timestamps
  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  read_at!: Date | null;
}
