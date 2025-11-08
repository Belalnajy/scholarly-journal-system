import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article } from '../../database/entities/article.entity';
import { Research } from '../../database/entities/research.entity';
import { SiteSettings } from '../../database/entities/site-settings.entity';
import { IssuesModule } from '../issues/issues.module';
import { QRCodeModule } from '../qrcode/qrcode.module';
import { ResearchModule } from '../research/research.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Research, SiteSettings]),
    IssuesModule,
    QRCodeModule,
    CloudinaryModule,
    PdfModule,
    forwardRef(() => ResearchModule),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
