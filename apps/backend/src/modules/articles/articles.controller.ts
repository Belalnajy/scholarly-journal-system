import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ArticleStatus } from '../../database/entities/article.entity';

@Controller('articles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /**
   * Create a new article (Admin/Editor only)
   */
  @Post()
  @Roles('admin', 'editor')
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  /**
   * Create a manual article with PDF upload (Admin/Editor only)
   */
  @Post('manual')
  @Roles('admin', 'editor')
  @UseInterceptors(FileInterceptor('file'))
  async createManualArticle(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    // Parse JSON fields
    const authors = body.authors ? JSON.parse(body.authors) : [];
    const keywords = body.keywords ? JSON.parse(body.keywords) : undefined;
    const keywords_en = body.keywords_en ? JSON.parse(body.keywords_en) : undefined;

    const createArticleDto: CreateArticleDto = {
      issue_id: body.issue_id,
      article_number: body.article_number,
      title: body.title,
      title_en: body.title_en,
      authors,
      abstract: body.abstract,
      abstract_en: body.abstract_en,
      keywords,
      keywords_en,
      specialization: body.specialization,
      pages: body.pages,
      doi: body.doi,
      pdf_url: '', // Will be set by service after upload
      status: body.status as ArticleStatus,
      published_date: body.published_date,
    };

    return this.articlesService.createManualArticle(createArticleDto, file);
  }

  /**
   * Get published articles (Public)
   */
  @Get('published')
  @Public()
  getPublishedArticles(@Query('issueId') issueId?: string) {
    return this.articlesService.getPublishedArticles(issueId);
  }

  /**
   * Search articles (Public)
   */
  @Get('search')
  @Public()
  search(@Query('q') query: string) {
    return this.articlesService.search(query);
  }

  /**
   * Get article statistics (Admin/Editor only)
   */
  @Get('stats')
  @Roles('admin', 'editor')
  getStats() {
    return this.articlesService.getStats();
  }

  /**
   * Get article by article number (Public)
   */
  @Get('number/:articleNumber')
  @Public()
  findByArticleNumber(@Param('articleNumber') articleNumber: string) {
    return this.articlesService.findByArticleNumber(articleNumber);
  }

  /**
   * Get article by research ID (Admin/Editor only)
   */
  @Get('research/:researchId')
  @Roles('admin', 'editor')
  findByResearchId(@Param('researchId', ParseUUIDPipe) researchId: string) {
    return this.articlesService.findByResearchId(researchId);
  }

  /**
   * Verify article by ID (Public - for QR code scanning)
   */
  @Get('verify/:id')
  @Public()
  verifyArticle(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.verifyArticle(id);
  }

  /**
   * Verify article by DOI (Public)
   */
  @Get('verify/doi/:doi')
  @Public()
  verifyArticleByDOI(@Param('doi') doi: string) {
    return this.articlesService.verifyArticleByDOI(decodeURIComponent(doi));
  }

  /**
   * Get all articles (Admin/Editor only)
   */
  @Get()
  @Roles('admin', 'editor')
  findAll(
    @Query('issueId') issueId?: string,
    @Query('status') status?: ArticleStatus,
  ) {
    return this.articlesService.findAll(issueId, status);
  }

  /**
   * Get a single article by ID (Public)
   */
  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.findOne(id);
  }

  /**
   * Update an article (Admin/Editor only)
   */
  @Patch(':id')
  @Roles('admin', 'editor')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, updateArticleDto);
  }

  /**
   * Publish an article (Admin/Editor only)
   */
  @Patch(':id/publish')
  @Roles('admin', 'editor')
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.publish(id);
  }

  /**
   * Increment views count (Public)
   */
  @Post(':id/view')
  @Public()
  incrementViews(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.incrementViews(id);
  }

  /**
   * Increment downloads count (Public)
   */
  @Post(':id/download')
  @Public()
  incrementDownloads(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.incrementDownloads(id);
  }

  /**
   * Increment citations count (Admin/Editor only)
   */
  @Post(':id/citation')
  @Roles('admin', 'editor')
  incrementCitations(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.incrementCitations(id);
  }

  /**
   * Delete an article (Admin only)
   */
  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.remove(id);
  }

  /**
   * Regenerate QR Code for article (Admin/Editor only)
   */
  @Post(':id/regenerate-qr')
  @Roles('admin', 'editor')
  regenerateQRCode(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.regenerateQRCode(id);
  }
}
