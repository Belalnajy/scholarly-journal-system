import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({
    type: 'enum',
    enum: ['researcher', 'reviewer', 'editor', 'admin'],
    default: 'researcher',
  })
  role!: string;

  // Profile Info
  @Column({ nullable: true })
  avatar_url!: string;

  @Column({ type: 'text', nullable: true })
  avatar_cloudinary_public_id!: string;

  @Column({ type: 'text', nullable: true })
  avatar_cloudinary_secure_url!: string;

  @Column({ nullable: true })
  affiliation!: string;

  @Column({ nullable: true })
  department!: string;

  @Column({ nullable: true })
  specialization!: string;

  @Column({
    type: 'enum',
    enum: [
      'bachelor',
      'master',
      'phd',
      'assistant-professor',
      'associate-professor',
      'professor',
    ],
    nullable: true,
  })
  academic_degree!: string;

  // Academic IDs
  @Column({ nullable: true })
  orcid_id!: string;

  @Column({ nullable: true })
  google_scholar_id!: string;

  @Column({ nullable: true })
  research_gate_id!: string;

  // Additional Info
  @Column({ type: 'text', nullable: true })
  research_interests!: string;

  @Column({ type: 'text', nullable: true })
  expertise_areas!: string;

  @Column({ nullable: true })
  languages_spoken!: string;

  @Column({ type: 'int', default: 0 })
  years_of_experience!: number;

  @Column({ type: 'int', default: 0 })
  number_of_publications!: number;

  @Column({ type: 'text', nullable: true })
  bio!: string;

  // Status
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  status!: string;

  // Payment Status for Research Submission
  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'verified'],
    default: 'pending',
  })
  payment_status!: string;

  @Column({ type: 'timestamp', nullable: true })
  payment_verified_at!: Date;

  // Timestamps
  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login!: Date;

  // Hash password before insert/update
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      // Only hash if not already hashed
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Method to compare passwords
  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }
}
