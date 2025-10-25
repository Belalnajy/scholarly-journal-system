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
 * Contact Submission Entity
 * يدير رسائل التواصل المرسلة من المستخدمين
 */

export enum ContactSubmissionStatus {
  PENDING = 'pending',      // قيد الانتظار
  IN_PROGRESS = 'in_progress', // قيد المعالجة
  RESOLVED = 'resolved',    // تم الحل
  CLOSED = 'closed',        // مغلق
}

@Entity('contact_submissions')
export class ContactSubmission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // User who submitted (optional - can be guest)
  @Column({ type: 'uuid', nullable: true })
  user_id!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  // Contact information
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  // Message details
  @Column({ type: 'varchar', length: 500 })
  subject!: string;

  @Column({ type: 'text' })
  message!: string;

  // Status
  @Column({
    type: 'enum',
    enum: ContactSubmissionStatus,
    default: ContactSubmissionStatus.PENDING,
  })
  status!: ContactSubmissionStatus;

  // Timestamps
  @CreateDateColumn()
  submitted_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  responded_at!: Date | null;
}
