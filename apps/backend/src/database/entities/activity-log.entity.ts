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
 * Activity Log Entity
 * يسجل جميع الأنشطة والإجراءات التي يقوم بها المستخدمون في النظام
 */

export enum ActivityAction {
  // User Actions - إجراءات المستخدم
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  USER_UPDATE_PROFILE = 'user_update_profile',
  
  // Research Actions - إجراءات البحث
  RESEARCH_SUBMIT = 'research_submit',
  RESEARCH_UPDATE = 'research_update',
  RESEARCH_DELETE = 'research_delete',
  RESEARCH_ACCEPT = 'research_accept',
  RESEARCH_REJECT = 'research_reject',
  RESEARCH_PUBLISH = 'research_publish',
  
  // Review Actions - إجراءات المراجعة
  REVIEW_ASSIGN = 'review_assign',
  REVIEW_SUBMIT = 'review_submit',
  REVIEW_UPDATE = 'review_update',
  
  // Admin Actions - إجراءات الإدارة
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_STATUS_CHANGE = 'user_status_change',
  
  // Other Actions - إجراءات أخرى
  FILE_UPLOAD = 'file_upload',
  FILE_DELETE = 'file_delete',
  SETTINGS_UPDATE = 'settings_update',
}

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // User who performed the action
  @Column({ type: 'uuid', nullable: true })
  user_id!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  // Research related to the action (optional)
  @Column({ type: 'uuid', nullable: true })
  research_id!: string | null;

  // Type of action performed
  @Column({
    type: 'enum',
    enum: ActivityAction,
  })
  action_type!: ActivityAction;

  // Description of the action
  @Column({ type: 'text' })
  description!: string;

  // Additional metadata (JSON format)
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null;

  // Timestamp
  @CreateDateColumn()
  created_at!: Date;
}
