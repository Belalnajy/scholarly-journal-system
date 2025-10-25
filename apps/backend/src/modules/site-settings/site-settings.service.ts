import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSettings } from '../../database/entities/site-settings.entity';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectRepository(SiteSettings)
    private readonly siteSettingsRepository: Repository<SiteSettings>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Get site settings (singleton pattern)
   * If no settings exist, create default settings
   */
  async getSettings(): Promise<SiteSettings> {
    const settings = await this.siteSettingsRepository.find();

    // If no settings exist, create default settings
    if (settings.length === 0) {
      const defaultSettings = this.siteSettingsRepository.create({
        site_name: 'مجلة الدراسات والبحوث',
        site_name_en: 'Journal of Studies and Research',
        is_maintenance_mode: false,
      });
      return await this.siteSettingsRepository.save(defaultSettings);
    }

    // Return the first (and should be only) settings record
    return settings[0];
  }

  /**
   * Update site settings
   */
  async updateSettings(
    updateSiteSettingsDto: UpdateSiteSettingsDto,
  ): Promise<SiteSettings> {
    const settings = await this.getSettings();

    // Update settings
    Object.assign(settings, updateSiteSettingsDto);

    return await this.siteSettingsRepository.save(settings);
  }

  /**
   * Get public settings (for frontend)
   * Excludes sensitive information
   */
  async getPublicSettings() {
    const settings = await this.getSettings();

    return {
      site_name: settings.site_name,
      site_name_en: settings.site_name_en,
      logo_url: settings.logo_url,
      favicon_url: settings.favicon_url,
      about_intro: settings.about_intro,
      mission: settings.mission,
      vision: settings.vision,
      goals: settings.goals,
      contact_info: settings.contact_info,
      social_links: settings.social_links,
      is_maintenance_mode: settings.is_maintenance_mode,
      maintenance_message: settings.maintenance_message,
    };
  }

  /**
   * Toggle maintenance mode
   */
  async toggleMaintenanceMode(enabled: boolean): Promise<SiteSettings> {
    const settings = await this.getSettings();
    settings.is_maintenance_mode = enabled;
    return await this.siteSettingsRepository.save(settings);
  }

  /**
   * Upload logo to Cloudinary
   */
  async uploadLogo(file: Express.Multer.File): Promise<{ logo_url: string }> {
    if (!file) {
      throw new BadRequestException('لم يتم تحديد ملف');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('نوع الملف غير مدعوم. يرجى رفع صورة (JPG, PNG, GIF, WEBP, SVG)');
    }

    // Upload to Cloudinary
    const result = await this.cloudinaryService.uploadFile(
      file.buffer,
      'site-assets/logo',
      'image',
      {
        public_id: `logo_${Date.now()}`,
        overwrite: true,
        access_mode: 'public',
      }
    );

    // Update settings with new logo URL
    const settings = await this.getSettings();
    settings.logo_url = result.secure_url;
    await this.siteSettingsRepository.save(settings);

    return { logo_url: result.secure_url };
  }

  /**
   * Upload favicon to Cloudinary
   */
  async uploadFavicon(file: Express.Multer.File): Promise<{ favicon_url: string }> {
    if (!file) {
      throw new BadRequestException('لم يتم تحديد ملف');
    }

    // Validate file type
    const allowedTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('نوع الملف غير مدعوم. يرجى رفع أيقونة (ICO, PNG, JPG)');
    }

    // Upload to Cloudinary
    const result = await this.cloudinaryService.uploadFile(
      file.buffer,
      'site-assets/favicon',
      'image',
      {
        public_id: `favicon_${Date.now()}`,
        overwrite: true,
        access_mode: 'public',
      }
    );

    // Update settings with new favicon URL
    const settings = await this.getSettings();
    settings.favicon_url = result.secure_url;
    await this.siteSettingsRepository.save(settings);

    return { favicon_url: result.secure_url };
  }
}
