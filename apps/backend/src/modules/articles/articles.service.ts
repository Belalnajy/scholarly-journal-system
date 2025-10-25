import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article, ArticleStatus } from '../../database/entities/article.entity';
import { Research, ResearchStatus } from '../../database/entities/research.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { IssuesService } from '../issues/issues.service';
import { QRCodeService } from '../qrcode/qrcode.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Research)
    private readonly researchRepository: Repository<Research>,
    private readonly issuesService: IssuesService,
    private readonly qrcodeService: QRCodeService,
  ) {}

  /**
   * Create a new article
   */
  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    // Check if article number already exists
    const existingArticle = await this.articleRepository.findOne({
      where: { article_number: createArticleDto.article_number },
    });

    if (existingArticle) {
      throw new ConflictException('رقم المقال موجود بالفعل');
    }

    // Verify issue exists and check max articles limit
    const issue = await this.issuesService.findOne(createArticleDto.issue_id);
    
    // Check if issue has reached max articles limit
    if (issue.total_articles >= issue.max_articles) {
      throw new BadRequestException(
        `لا يمكن إضافة المزيد من المقالات. الحد الأقصى للعدد هو ${issue.max_articles} مقال`,
      );
    }

    // If research_id is provided, verify it exists and update it
    if (createArticleDto.research_id) {
      const research = await this.researchRepository.findOne({
        where: { id: createArticleDto.research_id },
      });

      if (!research) {
        throw new NotFoundException('البحث غير موجود');
      }

      // Check if research is already published
      if (research.published_article_id) {
        throw new ConflictException('البحث منشور بالفعل كمقال');
      }
    }

    const article = this.articleRepository.create(createArticleDto);
    const savedArticle = await this.articleRepository.save(article);

    // Generate QR Code for article verification
    try {
      const verificationUrl = this.qrcodeService.generateArticleVerificationUrl(
        savedArticle.id,
      );
      const qrCodeResult = await this.qrcodeService.generateAndUploadQRCode(
        verificationUrl,
        `articles/qrcodes`,
        `article_${savedArticle.article_number}_qr`,
      );

      // Update article with QR code URL
      savedArticle.qr_code_url = qrCodeResult.url;
      savedArticle.qr_code_public_id = qrCodeResult.publicId;
      await this.articleRepository.save(savedArticle);
    } catch (error) {
      console.error('فشل في توليد رمز QR للمقال:', error);
      // Continue without QR code - don't fail the article creation
    }

    // Update research status and link to article
    if (createArticleDto.research_id) {
      await this.researchRepository.update(createArticleDto.research_id, {
        status: ResearchStatus.PUBLISHED,
        published_article_id: savedArticle.id,
        published_date: new Date(),
      });
    }

    // Update issue stats
    await this.issuesService.updateStats(createArticleDto.issue_id);

    return savedArticle;
  }

  /**
   * Get all articles with optional filters
   */
  async findAll(issueId?: string, status?: ArticleStatus): Promise<Article[]> {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.issue', 'issue')
      .leftJoinAndSelect('article.research', 'research')
      .orderBy('article.created_at', 'DESC');

    if (issueId) {
      query.where('article.issue_id = :issueId', { issueId });
    }

    if (status) {
      query.andWhere('article.status = :status', { status });
    }

    return await query.getMany();
  }

  /**
   * Get a single article by ID
   */
  async findOne(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['issue', 'research'],
    });

    if (!article) {
      throw new NotFoundException('المقال غير موجود');
    }

    return article;
  }

  /**
   * Get article by article number
   */
  async findByArticleNumber(articleNumber: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { article_number: articleNumber },
      relations: ['issue', 'research'],
    });

    if (!article) {
      throw new NotFoundException('المقال غير موجود');
    }

    return article;
  }

  /**
   * Get article by research ID
   */
  async findByResearchId(researchId: string): Promise<Article | null> {
    return await this.articleRepository.findOne({
      where: { research_id: researchId },
      relations: ['issue', 'research'],
    });
  }

  /**
   * Update an article
   */
  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOne(id);

    // Check if article number is being changed and if it already exists
    if (
      updateArticleDto.article_number &&
      updateArticleDto.article_number !== article.article_number
    ) {
      const existingArticle = await this.articleRepository.findOne({
        where: { article_number: updateArticleDto.article_number },
      });

      if (existingArticle) {
        throw new ConflictException('رقم المقال موجود بالفعل');
      }
    }

    // If issue is being changed, verify new issue exists
    if (updateArticleDto.issue_id && updateArticleDto.issue_id !== article.issue_id) {
      await this.issuesService.findOne(updateArticleDto.issue_id);
      
      // Update stats for both old and new issues
      await this.issuesService.updateStats(article.issue_id);
      await this.issuesService.updateStats(updateArticleDto.issue_id);
    }

    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }

  /**
   * Delete an article
   */
  async remove(id: string): Promise<void> {
    const article = await this.findOne(id);

    // If article is linked to research, unlink it
    if (article.research_id) {
      await this.researchRepository.update(article.research_id, {
        published_article_id: null,
        status: ResearchStatus.ACCEPTED,
      });
    }

    await this.articleRepository.remove(article);

    // Update issue stats
    await this.issuesService.updateStats(article.issue_id);
  }

  /**
   * Publish an article
   */
  async publish(id: string): Promise<Article> {
    const article = await this.findOne(id);

    if (article.status === ArticleStatus.PUBLISHED) {
      throw new BadRequestException('المقال منشور بالفعل');
    }

    article.status = ArticleStatus.PUBLISHED;
    article.published_date = new Date();

    return await this.articleRepository.save(article);
  }

  /**
   * Increment views count
   */
  async incrementViews(id: string): Promise<void> {
    await this.articleRepository.increment({ id }, 'views_count', 1);
  }

  /**
   * Increment downloads count
   */
  async incrementDownloads(id: string): Promise<void> {
    await this.articleRepository.increment({ id }, 'downloads_count', 1);
  }

  /**
   * Increment citations count
   */
  async incrementCitations(id: string): Promise<void> {
    await this.articleRepository.increment({ id }, 'citations_count', 1);
  }

  /**
   * Get published articles (public endpoint)
   */
  async getPublishedArticles(issueId?: string): Promise<Article[]> {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.issue', 'issue')
      .where('article.status = :status', { status: ArticleStatus.PUBLISHED })
      .orderBy('article.published_date', 'DESC');

    if (issueId) {
      query.andWhere('article.issue_id = :issueId', { issueId });
    }

    return await query.getMany();
  }

  /**
   * Search articles by title or keywords
   */
  async search(query: string): Promise<Article[]> {
    return await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.issue', 'issue')
      .where('article.status = :status', { status: ArticleStatus.PUBLISHED })
      .andWhere(
        '(article.title ILIKE :query OR article.title_en ILIKE :query OR article.abstract ILIKE :query OR article.abstract_en ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('article.published_date', 'DESC')
      .getMany();
  }

  /**
   * Get article statistics
   */
  async getStats() {
    const [totalArticles, publishedArticles] = await Promise.all([
      this.articleRepository.count(),
      this.articleRepository.count({
        where: { status: ArticleStatus.PUBLISHED },
      }),
    ]);

    const stats = await this.articleRepository
      .createQueryBuilder('article')
      .select('SUM(article.views_count)', 'totalViews')
      .addSelect('SUM(article.downloads_count)', 'totalDownloads')
      .addSelect('SUM(article.citations_count)', 'totalCitations')
      .getRawOne();

    return {
      totalArticles,
      publishedArticles,
      readyToPublish: totalArticles - publishedArticles,
      totalViews: parseInt(stats.totalViews) || 0,
      totalDownloads: parseInt(stats.totalDownloads) || 0,
      totalCitations: parseInt(stats.totalCitations) || 0,
    };
  }

  /**
   * Verify article by ID (for QR code verification)
   */
  async verifyArticle(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['issue', 'research'],
    });

    if (!article) {
      throw new NotFoundException('المقال غير موجود');
    }

    // Only allow verification for published or ready-to-publish articles
    if (article.status !== ArticleStatus.PUBLISHED && article.status !== ArticleStatus.READY_TO_PUBLISH) {
      throw new NotFoundException('المقال غير متاح للتحقق');
    }

    // Increment views count
    await this.incrementViews(id);

    return article;
  }

  /**
   * Verify article by DOI
   */
  async verifyArticleByDOI(doi: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { doi, status: ArticleStatus.PUBLISHED },
      relations: ['issue', 'research'],
    });

    if (!article) {
      throw new NotFoundException('المقال غير موجود أو غير منشور');
    }

    // Increment views count
    await this.incrementViews(article.id);

    return article;
  }

  /**
   * Regenerate QR Code for an article
   */
  async regenerateQRCode(id: string): Promise<Article> {
    const article = await this.findOne(id);

    // Delete old QR code if exists
    if (article.qr_code_public_id) {
      try {
        await this.qrcodeService.deleteQRCode(article.qr_code_public_id);
      } catch (error) {
        console.error('فشل في حذف رمز QR القديم:', error);
      }
    }

    // Generate new QR Code
    const verificationUrl = this.qrcodeService.generateArticleVerificationUrl(
      article.id,
    );
    const qrCodeResult = await this.qrcodeService.generateAndUploadQRCode(
      verificationUrl,
      `articles/qrcodes`,
      `article_${article.article_number}_qr`,
    );

    // Update article
    article.qr_code_url = qrCodeResult.url;
    article.qr_code_public_id = qrCodeResult.publicId;

    return await this.articleRepository.save(article);
  }
}
