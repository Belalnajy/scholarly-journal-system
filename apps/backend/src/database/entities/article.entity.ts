import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Issue } from './issue.entity';
import { Research } from './research.entity';

export enum ArticleStatus {
  READY_TO_PUBLISH = 'ready-to-publish',
  PUBLISHED = 'published',
}

export interface Author {
  name: string;
  affiliation: string;
  email: string;
}

@Entity('articles')
@Index('idx_articles_issue_status', ['issue_id', 'status'])
@Index('idx_articles_published_date', ['published_date'])
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true, nullable: true })
  @Index('idx_articles_research')
  research_id!: string;

  @Column({ type: 'uuid' })
  @Index('idx_articles_issue')
  issue_id!: string;

  @Column({ unique: true, length: 50 })
  @Index('idx_articles_number')
  article_number!: string;

  // Article Info
  @Column({ length: 500 })
  title!: string;

  @Column({ length: 500, nullable: true })
  title_en!: string;

  @Column({ type: 'json' })
  authors!: Author[];

  @Column({ type: 'text' })
  abstract!: string;

  @Column({ type: 'text', nullable: true })
  abstract_en!: string;

  @Column({ type: 'json', nullable: true })
  keywords!: string[];

  @Column({ type: 'json', nullable: true })
  keywords_en!: string[];

  @Column({ length: 50, nullable: true })
  pages!: string; // "1-15"

  @Column({ length: 255, nullable: true })
  doi!: string;

  @Column({ type: 'text' })
  pdf_url!: string;

  // Cloudinary fields
  @Column({ type: 'text', nullable: true })
  cloudinary_public_id!: string;

  @Column({ type: 'text', nullable: true })
  cloudinary_secure_url!: string;

  // QR Code for verification
  @Column({ type: 'text', nullable: true })
  qr_code_url!: string;

  @Column({ type: 'text', nullable: true })
  qr_code_public_id!: string;

  // Acceptance Certificate
  @Column({ type: 'text', nullable: true })
  acceptance_certificate_url!: string;

  @Column({ type: 'text', nullable: true })
  acceptance_certificate_cloudinary_public_id!: string;

  @Column({ type: 'text', nullable: true })
  acceptance_certificate_cloudinary_secure_url!: string;

  @Column({ type: 'text', nullable: true })
  acceptance_certificate_custom_message!: string;

  // Status
  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.READY_TO_PUBLISH,
  })
  @Index('idx_articles_status')
  status!: ArticleStatus;

  // Stats
  @Column({ type: 'int', default: 0 })
  views_count!: number;

  @Column({ type: 'int', default: 0 })
  downloads_count!: number;

  @Column({ type: 'int', default: 0 })
  citations_count!: number;

  // Dates
  @Column({ type: 'timestamp', nullable: true })
  published_date!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Issue, (issue) => issue.articles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issue_id' })
  issue!: Issue;

  @OneToOne(() => Research, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'research_id' })
  research!: Research;
}
