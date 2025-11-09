import { Controller, Get, Patch, Body, Post, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SiteSettingsService } from './site-settings.service';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('site-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  /**
   * Get site settings (admin)
   */
  @Get()
  @Roles('admin', 'editor') // Only admin and editor can view full settings
  getSettings() {
    return this.siteSettingsService.getSettings();
  }

  /**
   * Get public settings (for frontend)
   */
  @Get('public')
  @Public() // Public endpoint - no authentication required
  getPublicSettings() {
    return this.siteSettingsService.getPublicSettings();
  }

  /**
   * Update site settings
   */
  @Patch()
  @Roles('admin') // Only admin can update settings
  updateSettings(@Body() updateSiteSettingsDto: UpdateSiteSettingsDto) {
    return this.siteSettingsService.updateSettings(updateSiteSettingsDto);
  }

  /**
   * Toggle maintenance mode
   */
  @Post('maintenance-mode')
  @Roles('admin') // Only admin can toggle maintenance mode
  toggleMaintenanceMode(@Body() body: { enabled: boolean }) {
    return this.siteSettingsService.toggleMaintenanceMode(body.enabled);
  }

  /**
   * Upload logo
   */
  @Post('upload-logo')
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadLogo(@UploadedFile() file: Express.Multer.File) {
    return this.siteSettingsService.uploadLogo(file);
  }

  /**
   * Upload favicon
   */
  @Post('upload-favicon')
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('favicon', {
      storage: memoryStorage(),
      limits: {
        fileSize: 1 * 1024 * 1024, // 1MB
      },
    }),
  )
  uploadFavicon(@UploadedFile() file: Express.Multer.File) {
    return this.siteSettingsService.uploadFavicon(file);
  }

  /**
   * Upload official stamp
   */
  @Post('upload-stamp')
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('stamp', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  uploadStamp(@UploadedFile() file: Express.Multer.File) {
    return this.siteSettingsService.uploadStamp(file);
  }
}
