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
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { IssueStatus } from '../../database/entities/issue.entity';

@Controller('issues')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  /**
   * Create a new issue (Admin/Editor only)
   */
  @Post()
  @Roles('admin', 'editor')
  create(@Body() createIssueDto: CreateIssueDto) {
    return this.issuesService.create(createIssueDto);
  }

  /**
   * Get published issues (Public)
   */
  @Get('published')
  @Public()
  getPublishedIssues() {
    return this.issuesService.getPublishedIssues();
  }

  /**
   * Get latest published issue (Public)
   */
  @Get('latest')
  @Public()
  getLatestIssue() {
    return this.issuesService.getLatestIssue();
  }

  /**
   * Get issue by issue number (Public)
   */
  @Get('number/:issueNumber')
  @Public()
  findByIssueNumber(@Param('issueNumber') issueNumber: string) {
    return this.issuesService.findByIssueNumber(issueNumber);
  }

  /**
   * Get all issues (Admin/Editor only)
   */
  @Get()
  @Roles('admin', 'editor')
  findAll(@Query('status') status?: IssueStatus) {
    return this.issuesService.findAll(status);
  }

  /**
   * Get a single issue by ID (Public)
   */
  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.issuesService.findOne(id);
  }

  /**
   * Update an issue (Admin/Editor only)
   */
  @Patch(':id')
  @Roles('admin', 'editor')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateIssueDto: UpdateIssueDto,
  ) {
    return this.issuesService.update(id, updateIssueDto);
  }

  /**
   * Publish an issue (Admin/Editor only)
   */
  @Patch(':id/publish')
  @Roles('admin', 'editor')
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.issuesService.publish(id);
  }

  /**
   * Update issue statistics (Admin/Editor only)
   */
  @Patch(':id/update-stats')
  @Roles('admin', 'editor')
  updateStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.issuesService.updateStats(id);
  }

  /**
   * Increment views count (Public)
   */
  @Post(':id/view')
  @Public()
  incrementViews(@Param('id', ParseUUIDPipe) id: string) {
    return this.issuesService.incrementViews(id);
  }

  /**
   * Increment downloads count (Public)
   */
  @Post(':id/download')
  @Public()
  incrementDownloads(@Param('id', ParseUUIDPipe) id: string) {
    return this.issuesService.incrementDownloads(id);
  }

  /**
   * Upload full issue PDF (Admin/Editor only)
   */
  @Post(':id/upload-full-pdf')
  @Roles('admin', 'editor')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFullIssuePdf(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('نوع الملف غير مدعوم. يرجى رفع ملف PDF فقط');
    }

    // Validate file size (max 50MB for full issue)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت');
    }

    return this.issuesService.uploadFullIssuePdf(
      id,
      file.buffer,
      file.originalname,
      file.size,
    );
  }

  /**
   * Delete an issue (Admin only)
   */
  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.issuesService.remove(id);
  }
}
