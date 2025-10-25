import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Research } from './research.entity';

export enum FileCategory {
  MAIN = 'main',
  SUPPLEMENTARY = 'supplementary',
  REVISION = 'revision',
}

@Entity('research_files')
@Index('idx_research_files_research', ['research_id'])
@Index('idx_research_files_category', ['file_category'])
export class ResearchFile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  research_id!: string;

  // File Info
  @Column({ length: 255 })
  file_name!: string;

  @Column({ type: 'text' })
  file_url!: string;

  @Column({ length: 100 })
  file_type!: string;

  @Column({ type: 'bigint' })
  file_size!: number;

  @Column({
    type: 'enum',
    enum: FileCategory,
    nullable: true,
  })
  file_category!: FileCategory;

  // Cloudinary fields
  @Column({ type: 'text', nullable: true })
  cloudinary_public_id!: string;

  @Column({ type: 'text', nullable: true })
  cloudinary_secure_url!: string;

  @Column({ type: 'text', nullable: true })
  cloudinary_format!: string;

  @Column({ type: 'text', nullable: true })
  cloudinary_resource_type!: string;

  // Timestamp
  @CreateDateColumn()
  uploaded_at!: Date;

  // Relations
  @ManyToOne(() => Research, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'research_id' })
  research!: Research;
}
