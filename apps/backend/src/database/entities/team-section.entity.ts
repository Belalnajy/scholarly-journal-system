import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('team_sections')
export class TeamSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 100 })
  icon: string; // Icon name from lucide-react

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  color: string; // Gradient color classes

  @Column({ type: 'int', default: 0 })
  display_order: number; // For ordering sections

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany('TeamMember', 'section')
  members: any[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
