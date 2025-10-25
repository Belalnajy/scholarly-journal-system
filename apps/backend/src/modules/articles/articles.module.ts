import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article } from '../../database/entities/article.entity';
import { Research } from '../../database/entities/research.entity';
import { IssuesModule } from '../issues/issues.module';
import { QRCodeModule } from '../qrcode/qrcode.module';
import { ResearchModule } from '../research/research.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Research]),
    IssuesModule,
    QRCodeModule,
    forwardRef(() => ResearchModule),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
