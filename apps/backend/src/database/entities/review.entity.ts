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

  // Detailed scoring system (out of 100)
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  total_score?: number;

  @Column({ type: 'jsonb', nullable: true })
  detailed_scores?: {
    title_score?: number; // العنوان (3 درجات)
    abstract_score?: number; // مستخلص البحث (2 درجة)
    methodology_score?: number; // منهج الرسالة (15 درجة)
    background_score?: number; // أدبيات الرسالة (15 درجة)
    results_score?: number; // نتائج البحث وتوصياته (15 درجة)
    documentation_score?: number; // التوثيق العلمي (15 درجة)
    originality_score?: number; // الأصالة والابتكار (15 درجة)
    formatting_score?: number; // إخراج البحث (2 درجة)
    research_condition_score?: number; // حالة البحث (10 درجات)
    sources_score?: number; // المصادر والمراجع (8 درجات)
  };

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

  // Reviewer's edited file (optional)
  @Column({ type: 'text', nullable: true })
  edited_file_url?: string;

  @Column({ type: 'text', nullable: true })
  edited_file_cloudinary_public_id?: string;

  @Column({ type: 'text', nullable: true })
  edited_file_cloudinary_secure_url?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  edited_file_type?: string;

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
