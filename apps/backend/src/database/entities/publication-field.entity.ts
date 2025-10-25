import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Publication Fields Entity
 * Represents the different fields/specializations available for publication
 */
@Entity('publication_fields')
export class PublicationField {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Field Names
  @Column()
  name_ar!: string;

  @Column({ nullable: true })
  name_en!: string;

  // Descriptions
  @Column({ type: 'text', nullable: true })
  description_ar!: string;

  @Column({ type: 'text', nullable: true })
  description_en!: string;

  // Display
  @Column({ type: 'int', default: 0 })
  display_order!: number;

  @Column({ default: true })
  is_active!: boolean;

  // Timestamps
  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
