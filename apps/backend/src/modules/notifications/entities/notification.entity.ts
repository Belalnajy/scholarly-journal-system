import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../../database/entities/user.entity';

export enum NotificationType {
  RESEARCH_SUBMITTED = 'research_submitted',
  REVIEWER_ASSIGNED = 'reviewer_assigned',
  REVIEW_SUBMITTED = 'review_submitted',
  REVISION_REQUESTED = 'revision_requested',
  REVISION_SUBMITTED = 'revision_submitted',
  RESEARCH_ACCEPTED = 'research_accepted',
  RESEARCH_REJECTED = 'research_rejected',
  RESEARCH_PUBLISHED = 'research_published',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ nullable: true })
  research_id: string;

  @Column({ nullable: true })
  link: string;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
