import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResearchService } from './research.service';
import { ResearchController } from './research.controller';
import { Research } from '../../database/entities/research.entity';
import { ResearchFile } from '../../database/entities/research-file.entity';
import { User } from '../../database/entities/user.entity';
import { SiteSettings } from '../../database/entities/site-settings.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PdfModule } from '../pdf/pdf.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Research, ResearchFile, User, SiteSettings]),
    NotificationsModule,
    CloudinaryModule,
    PdfModule,
    EmailModule,
  ],
  controllers: [ResearchController],
  providers: [ResearchService],
  exports: [ResearchService],
})
export class ResearchModule {}
