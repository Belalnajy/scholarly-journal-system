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

export enum ReviewerAssignmentStatus {
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  COMPLETED = 'completed',
}

@Entity('reviewer_assignments')
@Index('idx_assignments_research', ['research_id'])
@Index('idx_assignments_reviewer', ['reviewer_id'])
@Index('idx_assignments_status', ['status'])
@Index('idx_assignments_reviewer_status', ['reviewer_id', 'status'])
export class ReviewerAssignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  research_id!: string;

  @Column({ type: 'uuid' })
  reviewer_id!: string;

  @Column({ type: 'uuid' })
  assigned_by!: string;

  @Column({ type: 'text', nullable: true })
  assignment_notes?: string;

  @Column({ type: 'timestamp' })
  deadline!: Date;

  @Column({
    type: 'enum',
    enum: ReviewerAssignmentStatus,
    default: ReviewerAssignmentStatus.ASSIGNED,
  })
  status!: ReviewerAssignmentStatus;

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

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assigned_by' })
  assigner?: User;
}
