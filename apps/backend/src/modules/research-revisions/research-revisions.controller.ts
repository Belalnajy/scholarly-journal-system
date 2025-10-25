import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResearchRevisionsService } from './research-revisions.service';
import { CreateRevisionDto, UpdateRevisionDto, SubmitRevisionDto } from './dto';
import { RevisionStatus } from '../../database/entities/research-revision.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('research-revisions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResearchRevisionsController {
  constructor(private readonly revisionsService: ResearchRevisionsService) {}

  @Post()
  @Roles('researcher', 'admin', 'editor') // Researchers can create revision drafts
  create(@Body() createDto: CreateRevisionDto) {
    return this.revisionsService.create(createDto);
  }

  @Get()
  @Roles('researcher', 'reviewer', 'editor', 'admin') // Researchers and reviewers can view revisions
  findAll(
    @Query('research_id') research_id?: string,
    @Query('status') status?: RevisionStatus,
  ) {
    return this.revisionsService.findAll({ research_id, status });
  }

  @Get(':id')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can view revision details
  findOne(@Param('id') id: string) {
    return this.revisionsService.findOne(id);
  }

  @Put(':id')
  @Roles('researcher', 'admin', 'editor') // Researchers can update their revisions
  update(@Param('id') id: string, @Body() updateDto: UpdateRevisionDto) {
    return this.revisionsService.update(id, updateDto);
  }

  @Put(':id/submit')
  @Roles('researcher', 'admin', 'editor') // Researchers can submit revisions
  submitRevision(@Param('id') id: string, @Body() submitDto: SubmitRevisionDto) {
    return this.revisionsService.submitRevision(id, submitDto.file_url);
  }

  @Put(':id/approve')
  @Roles('admin', 'editor') // Only admin and editor can approve revisions
  approveRevision(@Param('id') id: string) {
    return this.revisionsService.approveRevision(id);
  }

  @Put(':id/reject')
  @Roles('admin', 'editor') // Only admin and editor can reject revisions
  rejectRevision(@Param('id') id: string) {
    return this.revisionsService.rejectRevision(id);
  }

  @Delete(':id')
  @Roles('researcher', 'admin', 'editor') // Researchers can delete their revision drafts
  delete(@Param('id') id: string) {
    return this.revisionsService.delete(id);
  }

  // Cloudinary Upload Endpoints
  @Post(':id/upload-file')
  @Roles('researcher', 'admin', 'editor') // Researchers can upload revision files
  @UseInterceptors(FileInterceptor('file'))
  async uploadRevisionFile(
    @Param('id') revision_id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.revisionsService.uploadRevisionFile(
      revision_id,
      file.buffer,
      file.originalname,
      file.size
    );
  }

  @Get(':id/download-url')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can download revision files
  getRevisionDownloadUrl(@Param('id') revision_id: string) {
    return this.revisionsService.getRevisionDownloadUrl(revision_id);
  }
}
