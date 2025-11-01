import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum ResearchStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under-review',
  PENDING_EDITOR_DECISION = 'pending-editor-decision',
  NEEDS_REVISION = 'needs-revision',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
}

@Entity('research')
@Index('idx_research_user_status', ['user_id', 'status'])
@Index('idx_research_status_submission', ['status', 'submission_date'])
export class Research {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ unique: true, length: 50 })
  research_number!: string;

  // Basic Info
  @Column({ length: 500 })
  title!: string;

  @Column({ length: 500, nullable: true })
  title_en!: string;

  @Column({ type: 'text' })
  abstract!: string;

  @Column({ type: 'text', nullable: true })
  abstract_en!: string;

  @Column({ type: 'json', nullable: true })
  keywords!: string[];

  @Column({ type: 'json', nullable: true })
  keywords_en!: string[];

  @Column({ length: 255 })
  specialization!: string;

  // File URL - Main research file
  @Column({ type: 'text', nullable: true })
  file_url!: string;

  // Cloudinary fields for main file
  @Column({ type: 'text', nullable: true })
  cloudinary_public_id!: string;

  @Column({ type: 'text', nullable: true })
  cloudinary_secure_url!: string;

  // File type/extension (pdf, doc, docx)
  @Column({ type: 'varchar', length: 10, nullable: true })
  file_type!: string;

  // File update tracking
  @Column({ type: 'timestamp', nullable: true })
  file_updated_at!: Date;

  @Column({ type: 'uuid', nullable: true })
  file_updated_by!: string;

  // Acceptance Certificate
  @Column({ type: 'text', nullable: true })
  acceptance_certificate_url!: string;

  @Column({ type: 'text', nullable: true })
  acceptance_certificate_cloudinary_public_id!: string;

  @Column({ type: 'text', nullable: true })
  acceptance_certificate_cloudinary_secure_url!: string;

  // Status & Publication
  @Column({
    type: 'enum',
    enum: ResearchStatus,
    default: ResearchStatus.UNDER_REVIEW,
  })
  status!: ResearchStatus;

  @Column({ type: 'uuid', nullable: true })
  published_article_id!: string;

  // Dates
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submission_date!: Date;

  @Column({ type: 'timestamp', nullable: true })
  evaluation_date!: Date;

  @Column({ type: 'timestamp', nullable: true })
  published_date!: Date;

  // Stats
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  average_rating!: number;

  @Column({ type: 'int', default: 0 })
  views_count!: number;

  @Column({ type: 'int', default: 0 })
  downloads_count!: number;

  // Timestamps
  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
