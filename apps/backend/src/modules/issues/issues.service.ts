import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue, IssueStatus } from '../../database/entities/issue.entity';
import { Article } from '../../database/entities/article.entity';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  /**
   * Create a new issue
   */
  async create(createIssueDto: CreateIssueDto): Promise<Issue> {
    // Check if issue number already exists
    const existingIssue = await this.issueRepository.findOne({
      where: { issue_number: createIssueDto.issue_number },
    });

    if (existingIssue) {
      throw new ConflictException('رقم العدد موجود بالفعل');
    }

    const issue = this.issueRepository.create(createIssueDto);
    return await this.issueRepository.save(issue);
  }

  /**
   * Get all issues with optional filters
   */
  async findAll(status?: IssueStatus): Promise<Issue[]> {
    const query = this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.articles', 'articles')
      .orderBy('issue.publish_date', 'DESC');

    if (status) {
      query.where('issue.status = :status', { status });
    }

    return await query.getMany();
  }

  /**
   * Get a single issue by ID
   */
  async findOne(id: string): Promise<Issue> {
    const issue = await this.issueRepository.findOne({
      where: { id },
      relations: ['articles'],
    });

    if (!issue) {
      throw new NotFoundException('العدد غير موجود');
    }

    return issue;
  }

  /**
   * Get issue by issue number
   */
  async findByIssueNumber(issueNumber: string): Promise<Issue> {
    const issue = await this.issueRepository.findOne({
      where: { issue_number: issueNumber },
      relations: ['articles'],
    });

    if (!issue) {
      throw new NotFoundException('العدد غير موجود');
    }

    return issue;
  }

  /**
   * Update an issue
   */
  async update(id: string, updateIssueDto: UpdateIssueDto): Promise<Issue> {
    const issue = await this.findOne(id);

    // Check if issue number is being changed and if it already exists
    if (
      updateIssueDto.issue_number &&
      updateIssueDto.issue_number !== issue.issue_number
    ) {
      const existingIssue = await this.issueRepository.findOne({
        where: { issue_number: updateIssueDto.issue_number },
      });

      if (existingIssue) {
        throw new ConflictException('رقم العدد موجود بالفعل');
      }
    }

    // Check if max_articles is being reduced below current total_articles
    if (
      updateIssueDto.max_articles !== undefined &&
      updateIssueDto.max_articles < issue.total_articles
    ) {
      throw new BadRequestException(
        `لا يمكن تقليل الحد الأقصى إلى ${updateIssueDto.max_articles} لأن العدد يحتوي بالفعل على ${issue.total_articles} مقال. يجب أن يكون الحد الأقصى ${issue.total_articles} على الأقل`,
      );
    }

    Object.assign(issue, updateIssueDto);
    return await this.issueRepository.save(issue);
  }

  /**
   * Delete an issue
   */
  async remove(id: string): Promise<void> {
    const issue = await this.findOne(id);

    // Check if issue has articles
    if (issue.articles && issue.articles.length > 0) {
      throw new BadRequestException(
        'لا يمكن حذف العدد لأنه يحتوي على مقالات',
      );
    }

    await this.issueRepository.remove(issue);
  }

  /**
   * Publish an issue
   */
  async publish(id: string): Promise<Issue> {
    const issue = await this.findOne(id);

    // Publish all articles in the issue (even if issue is already published)
    if (issue.articles && issue.articles.length > 0) {
      const currentDate = new Date();
      for (const article of issue.articles) {
        if (article.status === 'ready-to-publish') {
          article.status = 'published' as any;
          article.published_date = currentDate;
        }
      }
      // Save all articles
      await this.issueRepository.manager.save(issue.articles);
    }

    // Update issue status if not already published
    if (issue.status !== IssueStatus.PUBLISHED) {
      issue.status = IssueStatus.PUBLISHED;
      issue.progress_percentage = 100;
      // Update publish_date to actual publish date
      issue.publish_date = new Date();
      await this.issueRepository.save(issue);
    }

    return issue;
  }

  /**
   * Update issue statistics
   */
  async updateStats(id: string): Promise<Issue> {
    const issue = await this.issueRepository.findOne({ where: { id } });
    
    if (!issue) {
      throw new NotFoundException('العدد غير موجود');
    }

    // Count articles directly from database to ensure accuracy
    const articlesCount = await this.articleRepository.count({
      where: { issue_id: id },
    });

    // Get all articles for this issue to calculate total pages
    const articles = await this.articleRepository.find({
      where: { issue_id: id },
    });

    const totalPages = articles.reduce((sum, article) => {
      if (article.pages) {
        const [start, end] = article.pages.split('-').map(Number);
        return sum + (end - start + 1);
      }
      return sum;
    }, 0);

    issue.total_articles = articlesCount;
    issue.total_pages = totalPages;

    // Calculate progress percentage based on total articles (not just published)
    // Progress = (total articles / max articles) * 100
    if (issue.max_articles > 0) {
      issue.progress_percentage = Math.min(
        100,
        Math.round((articlesCount / issue.max_articles) * 100),
      );
    } else {
      issue.progress_percentage = 0;
    }

    return await this.issueRepository.save(issue);
  }

  /**
   * Increment views count
   */
  async incrementViews(id: string): Promise<void> {
    await this.issueRepository.increment({ id }, 'views_count', 1);
  }

  /**
   * Increment downloads count
   */
  async incrementDownloads(id: string): Promise<void> {
    await this.issueRepository.increment({ id }, 'downloads_count', 1);
  }

  /**
   * Get published issues (public endpoint)
   */
  async getPublishedIssues(): Promise<Issue[]> {
    return await this.issueRepository.find({
      where: { status: IssueStatus.PUBLISHED },
      relations: ['articles'],
      order: { publish_date: 'DESC' },
    });
  }

  /**
   * Get latest published issue
   */
  async getLatestIssue(): Promise<Issue | null> {
    return await this.issueRepository.findOne({
      where: { status: IssueStatus.PUBLISHED },
      relations: ['articles'],
      order: { publish_date: 'DESC' },
    });
  }
}
