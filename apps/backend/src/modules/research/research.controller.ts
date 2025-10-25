import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';
import { CreateResearchFileDto } from './dto/create-research-file.dto';
import { ResearchStatus } from '../../database/entities/research.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('research')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResearchController {
  constructor(
    private readonly researchService: ResearchService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post()
  @Roles('researcher', 'admin', 'editor') // Researchers can create research
  create(@Body() createResearchDto: CreateResearchDto) {
    return this.researchService.create(createResearchDto);
  }

  @Get()
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can view research
  findAll(
    @Query('user_id') user_id?: string,
    @Query('status') status?: ResearchStatus,
    @Query('specialization') specialization?: string
  ) {
    return this.researchService.findAll({ user_id, status, specialization });
  }

  @Get('stats')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can view stats
  getStats(@Query('user_id') user_id?: string) {
    return this.researchService.getStats(user_id);
  }

  @Get('number/:research_number')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can view research by number
  findByResearchNumber(@Param('research_number') research_number: string) {
    return this.researchService.findByResearchNumber(research_number);
  }

  @Get(':id')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can view research details
  findOne(@Param('id') id: string) {
    return this.researchService.findOne(id);
  }

  @Patch(':id')
  @Roles('researcher', 'admin', 'editor') // Researchers can update their own research
  update(
    @Param('id') id: string,
    @Body() updateResearchDto: UpdateResearchDto
  ) {
    return this.researchService.update(id, updateResearchDto);
  }

  @Patch(':id/status')
  @Roles('researcher', 'admin', 'editor') // Researchers can change status when submitting revisions
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ResearchStatus
  ) {
    return this.researchService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('admin') // Only admin can delete research
  remove(@Param('id') id: string) {
    return this.researchService.remove(id);
  }

  // Research Files Endpoints
  @Post('files')
  @Roles('researcher', 'admin', 'editor') // Researchers can add files
  addFile(@Body() createResearchFileDto: CreateResearchFileDto) {
    return this.researchService.addFile(createResearchFileDto);
  }

  @Get(':id/files')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can view research files
  getFiles(@Param('id') research_id: string) {
    return this.researchService.getFiles(research_id);
  }

  @Delete('files/:file_id')
  @Roles('researcher', 'admin', 'editor') // Researchers can delete their files
  removeFile(@Param('file_id') file_id: string) {
    return this.researchService.removeFile(file_id);
  }

  // Cloudinary Upload Endpoints
  @Post(':id/upload-pdf')
  @Roles('researcher', 'admin', 'editor') // Researchers can upload PDFs
  @UseInterceptors(FileInterceptor('file'))
  async uploadPDF(
    @Param('id') research_id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.researchService.uploadResearchPDF(
      research_id,
      file.buffer,
      file.originalname,
      file.size
    );
  }

  @Post(':id/upload-supplementary')
  @Roles('researcher', 'admin', 'editor') // Researchers can upload supplementary files
  @UseInterceptors(FileInterceptor('file'))
  async uploadSupplementary(
    @Param('id') research_id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category: string
  ) {
    return this.researchService.uploadSupplementaryFile(
      research_id,
      file.buffer,
      file.originalname,
      file.size,
      file.mimetype,
      category
    );
  }

  @Get('files/:file_id/download-url')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can download research files
  getFileDownloadUrl(@Param('file_id') file_id: string) {
    return this.researchService.getFileDownloadUrl(file_id);
  }

  @Get(':id/pdf-download-url')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can download research PDFs
  getResearchPdfDownloadUrl(@Param('id') research_id: string) {
    return this.researchService.getResearchPdfDownloadUrl(research_id);
  }

  @Get(':id/pdf-thumbnail')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can view PDF thumbnails
  getPdfThumbnail(
    @Param('id') research_id: string,
    @Query('page') page?: string
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    return this.researchService.getPdfThumbnail(research_id, pageNumber);
  }

  @Get(':id/pdf-view-url')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can view research PDFs
  getResearchPdfViewUrl(@Param('id') research_id: string) {
    return this.researchService.getResearchPdfViewUrl(research_id);
  }

  @Get('download')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can download files
  getSignedDownloadUrl(@Query('file') publicId: string) {
    if (!publicId) {
      return { error: 'Missing file parameter' };
    }

    try {
      const url = this.cloudinaryService.getAuthenticatedFileUrl(
        publicId,
        'raw',
        3600
      );
      return { url };
    } catch (error) {
      return {
        error: 'Failed to generate signed URL',
        message: error.message,
      };
    }
  }
}
