import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Site Settings Entity
 * Singleton table - should only have one row
 */
@Entity('site_settings')
export class SiteSettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Basic Info
  @Column({ default: 'مجلة الدراسات والبحوث' })
  site_name!: string;

  @Column({ nullable: true })
  site_name_en!: string;

  @Column({ nullable: true })
  logo_url!: string;

  @Column({ nullable: true })
  favicon_url!: string;

  // About Content
  @Column({ type: 'text', nullable: true })
  about_intro!: string;

  @Column({ type: 'text', nullable: true })
  mission!: string;

  @Column({ type: 'text', nullable: true })
  vision!: string;

  @Column({ type: 'json', nullable: true })
  goals!: string[];

  // Contact Info
  @Column({ type: 'json', nullable: true })
  contact_info!: {
    email?: string;
    phone?: string;
    address?: string;
    fax?: string;
  };

  @Column({ type: 'json', nullable: true })
  social_links!: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };

  // Settings
  @Column({ default: false })
  is_maintenance_mode!: boolean;

  @Column({ type: 'text', nullable: true })
  maintenance_message!: string;

  // Timestamps
  @UpdateDateColumn()
  updated_at!: Date;
}
