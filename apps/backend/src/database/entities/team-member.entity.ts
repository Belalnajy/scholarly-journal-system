import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TeamSection } from './team-section.entity';

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  title: string; // Job title (e.g., "رئيس التحرير")

  @Column({ type: 'varchar', length: 255 })
  role: string; // Specialization/role description

  @Column({ type: 'text', nullable: true })
  description: string; // Optional detailed description

  @Column({ type: 'varchar', length: 255, nullable: true })
  university: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string; // Cloudinary URL

  @Column({ type: 'int', default: 0 })
  display_order: number; // For ordering members within a section

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'uuid' })
  section_id: string;

  @ManyToOne(() => TeamSection, (section) => section.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: TeamSection;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
