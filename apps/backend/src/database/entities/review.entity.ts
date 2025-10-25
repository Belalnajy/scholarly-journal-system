import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Research } from './research.entity';

export enum ReviewRecommendation {
  ACCEPTED = 'accepted',
  NEEDS_REVISION = 'needs-revision',
  REJECTED = 'rejected',
}

export enum ReviewStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

@Entity('reviews')
@Index('idx_reviews_research', ['research_id'])
@Index('idx_reviews_reviewer', ['reviewer_id'])
@Index('idx_reviews_status', ['status'])
@Index('idx_reviews_research_status', ['research_id', 'status'])
@Index('idx_reviews_reviewer_status', ['reviewer_id', 'status'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  research_id!: string;

  @Column({ type: 'uuid' })
  reviewer_id!: string;

  @Column({ type: 'jsonb' })
  criteria_ratings!: Record<string, number>;

  @Column({ type: 'text' })
  general_comments!: string;

  @Column({
    type: 'enum',
    enum: ReviewRecommendation,
  })
  recommendation!: ReviewRecommendation;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  average_rating?: number;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status!: ReviewStatus;

  @Column({ type: 'timestamp', nullable: true })
  deadline?: Date;

  @Column({ type: 'timestamp', nullable: true })
  submitted_at?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Research, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'research_id' })
  research?: Research;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer?: User;
}
