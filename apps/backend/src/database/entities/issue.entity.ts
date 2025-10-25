import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Article } from './article.entity';

export enum IssueStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in-progress',
  PUBLISHED = 'published',
}

@Entity('issues')
@Index('idx_issues_status', ['status'])
@Index('idx_issues_publish_date', ['publish_date'])
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 50 })
  @Index('idx_issues_number')
  issue_number!: string;

  // Issue Info
  @Column({ length: 500 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'date' })
  publish_date!: Date;

  @Column({ type: 'int', default: 12 })
  max_articles!: number;

  @Column({ type: 'text', nullable: true })
  cover_image_url!: string;

  @Column({ type: 'text', nullable: true })
  cover_image_public_id!: string;

  // Issue PDF
  @Column({ type: 'text', nullable: true })
  issue_pdf_url!: string;

  @Column({ type: 'text', nullable: true })
  issue_pdf_public_id!: string;

  // Status
  @Column({
    type: 'enum',
    enum: IssueStatus,
    default: IssueStatus.PLANNED,
  })
  status!: IssueStatus;

  @Column({ type: 'int', default: 0 })
  progress_percentage!: number;

  // Stats
  @Column({ type: 'int', default: 0 })
  total_articles!: number;

  @Column({ type: 'int', default: 0 })
  total_pages!: number;

  @Column({ type: 'int', default: 0 })
  downloads_count!: number;

  @Column({ type: 'int', default: 0 })
  views_count!: number;

  // Timestamps
  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToMany(() => Article, (article) => article.issue)
  articles!: Article[];
}
