import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Research } from './research.entity';

export enum RevisionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('research_revisions')
export class ResearchRevision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  research_id: string;

  @ManyToOne(() => Research, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'research_id' })
  research: Research;

  @Column({ type: 'integer' })
  revision_number: number;

  @Column({ type: 'text' })
  revision_notes: string;

  @Column({ type: 'text', nullable: true })
  file_url: string;

  // Cloudinary fields for revision file
  @Column({ type: 'text', nullable: true })
  cloudinary_public_id: string;

  @Column({ type: 'text', nullable: true })
  cloudinary_secure_url: string;

  // Store original data before revision
  @Column({ type: 'jsonb', nullable: true })
  original_data: {
    abstract?: string;
    keywords?: string[];
    file_url?: string;
    cloudinary_public_id?: string;
    cloudinary_secure_url?: string;
  };

  @Column({
    type: 'varchar',
    length: 50,
    default: RevisionStatus.PENDING,
  })
  status: RevisionStatus;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column({ type: 'timestamp', nullable: true })
  submitted_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
