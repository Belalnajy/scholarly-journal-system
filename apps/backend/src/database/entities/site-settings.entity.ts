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
  journal_doi!: string;

  @Column({ nullable: true })
  journal_url!: string;

  @Column({ nullable: true })
  journal_issn!: string;

  @Column({ nullable: true })
  university_url!: string;

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
    whatsapp?: string;
    address?: string;
    fax?: string;
    website?: string;
    whatsapp_numbers?: Array<{
      number: string;
      label: string;
    }>;
  };

  @Column({ type: 'json', nullable: true })
  social_links!: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    telegram?: string;
    whatsapp_channel?: string;
  };

  // Settings
  @Column({ default: false })
  is_maintenance_mode!: boolean;

  @Column({ type: 'text', nullable: true })
  maintenance_message!: string;

  // Submission Fee
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  submission_fee!: number;

  @Column({ type: 'text', nullable: true })
  submission_fee_currency!: string;

  @Column({ type: 'text', nullable: true })
  payment_instructions!: string;

  // Acceptance Letter Content
  @Column({ type: 'text', nullable: true })
  acceptance_letter_content!: string;

  // Acceptance Certificate Settings
  @Column({ type: 'text', nullable: true })
  editor_in_chief_name!: string;

  @Column({ type: 'text', nullable: true })
  official_stamp_url!: string;

  @Column({ type: 'text', nullable: true })
  official_stamp_cloudinary_public_id!: string;

  // Timestamps
  @UpdateDateColumn()
  updated_at!: Date;
}
