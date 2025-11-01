import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateResearchDto } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';
import { CreateResearchFileDto } from './dto/create-research-file.dto';
import {
  Research,
  ResearchStatus,
} from '../../database/entities/research.entity';
import { ResearchFile } from '../../database/entities/research-file.entity';
import { User } from '../../database/entities/user.entity';
import { SiteSettings } from '../../database/entities/site-settings.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PdfGeneratorService } from '../pdf/pdf-generator.service';

@Injectable()
export class ResearchService {
  constructor(
    @InjectRepository(Research)
    private readonly researchRepository: Repository<Research>,
    @InjectRepository(ResearchFile)
    private readonly researchFileRepository: Repository<ResearchFile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SiteSettings)
    private readonly siteSettingsRepository: Repository<SiteSettings>,
    private readonly notificationsService: NotificationsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly pdfGeneratorService: PdfGeneratorService
  ) {}

  async create(createResearchDto: CreateResearchDto): Promise<Research> {
    // Check if research number already exists
    const existingResearch = await this.researchRepository.findOne({
      where: { research_number: createResearchDto.research_number },
    });

    if (existingResearch) {
      throw new ConflictException('رقم البحث موجود بالفعل');
    }

    const research = this.researchRepository.create(createResearchDto);
    const savedResearch = await this.researchRepository.save(research);

    // Send notification to editors and admins
    try {
      await this.notificationsService.notifyResearchSubmitted(
        savedResearch.id,
        savedResearch.title,
        savedResearch.user_id
      );
    } catch (error) {
      console.error('Failed to send research submission notification:', error);
    }

    return savedResearch;
  }

  async findAll(filters?: {
    user_id?: string;
    status?: ResearchStatus;
    specialization?: string;
  }): Promise<Research[]> {
    const query = this.researchRepository.createQueryBuilder('research');

    if (filters?.user_id) {
      query.andWhere('research.user_id = :user_id', {
        user_id: filters.user_id,
      });
    }

    if (filters?.status) {
      query.andWhere('research.status = :status', { status: filters.status });
    }

    if (filters?.specialization) {
      query.andWhere('research.specialization = :specialization', {
        specialization: filters.specialization,
      });
    }

    // Order by submission_date DESC, but put NULL values last using updated_at
    query.orderBy('research.submission_date', 'DESC', 'NULLS LAST');
    query.addOrderBy('research.updated_at', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Research> {
    const research = await this.researchRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!research) {
      throw new NotFoundException('البحث غير موجود');
    }

    return research;
  }

  async findByResearchNumber(research_number: string): Promise<Research> {
    const research = await this.researchRepository.findOne({
      where: { research_number },
      relations: ['user'],
    });

    if (!research) {
      throw new NotFoundException('البحث غير موجود');
    }

    return research;
  }

  async update(
    id: string,
    updateResearchDto: UpdateResearchDto
  ): Promise<Research> {
    const research = await this.findOne(id);

    // If updating research_number, check for conflicts
    if (
      updateResearchDto.research_number &&
      updateResearchDto.research_number !== research.research_number
    ) {
      const existingResearch = await this.researchRepository.findOne({
        where: { research_number: updateResearchDto.research_number },
      });

      if (existingResearch) {
        throw new ConflictException('رقم البحث موجود بالفعل');
      }
    }

    // Check if this is a draft being submitted (title changing from "مسودة")
    const wasDraft = research.title.includes('مسودة');
    const isBeingSubmitted = wasDraft && 
                            updateResearchDto.title && 
                            !updateResearchDto.title.includes('مسودة');

    Object.assign(research, updateResearchDto);
    
    // If status is changing to under-review and submission_date is null, set it
    if (updateResearchDto.status === ResearchStatus.UNDER_REVIEW && !research.submission_date) {
      research.submission_date = new Date();
    }
    
    const savedResearch = await this.researchRepository.save(research);

    // Auto-deactivate payment after successful research submission
    if (isBeingSubmitted && research.submission_date) {
      try {
        const user = await this.userRepository.findOne({ 
          where: { id: research.user_id } 
        });

        if (user && user.payment_status === 'verified') {
          // Reset payment status to pending
          user.payment_status = 'pending';
          user.payment_verified_at = null;
          await this.userRepository.save(user);

          // Send notification to user
          await this.notificationsService.create({
            user_id: user.id,
            type: 'general' as any,
            title: 'تم استهلاك رسوم التقديم',
            message: 'تم تقديم بحثك بنجاح. لتقديم بحث جديد، يرجى دفع رسوم التقديم مرة أخرى.',
          });
        }
      } catch (error) {
        console.error('Failed to auto-deactivate payment:', error);
        // Don't fail the research submission if payment deactivation fails
      }
    }
    
    return savedResearch;
  }

  async updateStatus(id: string, status: ResearchStatus): Promise<Research> {
    const research = await this.findOne(id);
    const previousStatus = research.status;
    research.status = status;

    if (status === ResearchStatus.ACCEPTED) {
      research.evaluation_date = new Date();
      
      // Generate acceptance certificate
      try {
        await this.generateAcceptanceCertificate(id);
      } catch (error) {
        console.error('Failed to generate acceptance certificate:', error);
        // Don't fail the status update if certificate generation fails
      }
    }

    if (status === ResearchStatus.PUBLISHED) {
      research.published_date = new Date();
    }

    const savedResearch = await this.researchRepository.save(research);

    // Send notifications based on status change
    try {
      if (
        status === ResearchStatus.ACCEPTED &&
        previousStatus !== ResearchStatus.ACCEPTED
      ) {
        await this.notificationsService.notifyResearchAccepted(
          savedResearch.id,
          savedResearch.title,
          savedResearch.user_id
        );
      } else if (
        status === ResearchStatus.REJECTED &&
        previousStatus !== ResearchStatus.REJECTED
      ) {
        await this.notificationsService.notifyResearchRejected(
          savedResearch.id,
          savedResearch.title,
          savedResearch.user_id
        );
      } else if (
        status === ResearchStatus.PUBLISHED &&
        previousStatus !== ResearchStatus.PUBLISHED
      ) {
        await this.notificationsService.notifyResearchPublished(
          savedResearch.id,
          savedResearch.title,
          savedResearch.user_id
        );
      } else if (
        status === ResearchStatus.NEEDS_REVISION &&
        previousStatus !== ResearchStatus.NEEDS_REVISION
      ) {
        await this.notificationsService.notifyRevisionRequested(
          savedResearch.id,
          savedResearch.title,
          savedResearch.user_id
        );
      }
    } catch (error) {
      console.error('Failed to send status change notification:', error);
    }

    return savedResearch;
  }

  async remove(id: string, user?: any): Promise<void> {
    const research = await this.findOne(id);
    
    // Check permissions
    if (user) {
      // Admin and editor can delete any research
      if (user.role === 'admin' || user.role === 'editor') {
        await this.researchRepository.remove(research);
        return;
      }
      
      // Researcher can only delete their own research if it's still a draft
      if (user.role === 'researcher') {
        if (research.user_id !== user.id) {
          throw new ForbiddenException('لا يمكنك حذف بحث لباحث آخر');
        }
        
        // Allow deletion if research is in draft state (title contains "مسودة" OR status is PENDING)
        const isDraft = research.title.includes('مسودة');
        const isPending = research.status === ResearchStatus.PENDING;
        
        if (isDraft || isPending) {
          await this.researchRepository.remove(research);
          return;
        }
        
        throw new ForbiddenException('لا يمكن حذف البحث بعد إرساله للمراجعة');
      }
    }
    
    // If no user provided (shouldn't happen), only admin can delete
    throw new ForbiddenException('غير مصرح لك بحذف هذا البحث');
  }

  async getStats(user_id?: string): Promise<{
    total: number;
    under_review: number;
    accepted: number;
    needs_revision: number;
    rejected: number;
    published: number;
  }> {
    const query = this.researchRepository.createQueryBuilder('research');

    if (user_id) {
      query.where('research.user_id = :user_id', { user_id });
    }

    const [total, under_review, accepted, needs_revision, rejected, published] =
      await Promise.all([
        query.getCount(),
        query
          .clone()
          .andWhere('research.status = :status', {
            status: ResearchStatus.UNDER_REVIEW,
          })
          .getCount(),
        query
          .clone()
          .andWhere('research.status = :status', {
            status: ResearchStatus.ACCEPTED,
          })
          .getCount(),
        query
          .clone()
          .andWhere('research.status = :status', {
            status: ResearchStatus.NEEDS_REVISION,
          })
          .getCount(),
        query
          .clone()
          .andWhere('research.status = :status', {
            status: ResearchStatus.REJECTED,
          })
          .getCount(),
        query
          .clone()
          .andWhere('research.status = :status', {
            status: ResearchStatus.PUBLISHED,
          })
          .getCount(),
      ]);

    return {
      total,
      under_review,
      accepted: accepted + published, // مقبولة + منشورة
      needs_revision,
      rejected,
      published,
    };
  }

  // Research Files Methods
  async addFile(
    createResearchFileDto: CreateResearchFileDto
  ): Promise<ResearchFile> {
    // Verify research exists
    await this.findOne(createResearchFileDto.research_id);

    const file = this.researchFileRepository.create(createResearchFileDto);
    return await this.researchFileRepository.save(file);
  }

  async getFiles(research_id: string): Promise<ResearchFile[]> {
    return await this.researchFileRepository.find({
      where: { research_id },
      order: { uploaded_at: 'DESC' },
    });
  }

  async removeFile(file_id: string): Promise<void> {
    const file = await this.researchFileRepository.findOne({
      where: { id: file_id },
    });

    if (!file) {
      throw new NotFoundException('الملف غير موجود');
    }

    // Delete from Cloudinary if exists
    if (file.cloudinary_public_id) {
      try {
        await this.cloudinaryService.deleteFile(
          file.cloudinary_public_id,
          file.cloudinary_resource_type as 'image' | 'raw' | 'video'
        );
      } catch (error) {
        console.error('Failed to delete file from Cloudinary:', error);
      }
    }

    await this.researchFileRepository.remove(file);
  }

  // Cloudinary Upload Methods
  async uploadResearchPDF(
    research_id: string,
    fileBuffer: Buffer,
    fileName: string,
    fileSize: number
  ): Promise<Research> {
    const research = await this.findOne(research_id);

    // Extract file extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';

    // Upload to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadResearchPDF(
      fileBuffer,
      research.research_number,
      fileName
    );

    // Update research with Cloudinary info and file type
    research.file_url = uploadResult.secure_url;
    research.cloudinary_public_id = uploadResult.public_id;
    research.cloudinary_secure_url = uploadResult.secure_url;
    research.file_type = fileExtension;

    return await this.researchRepository.save(research);
  }

  async updateResearchFile(
    research_id: string,
    fileBuffer: Buffer,
    fileName: string,
    fileSize: number,
    updated_by_user_id: string
  ): Promise<Research> {
    const research = await this.findOne(research_id);

    // Delete old file from Cloudinary if exists
    if (research.cloudinary_public_id) {
      try {
        await this.cloudinaryService.deleteFile(
          research.cloudinary_public_id,
          'raw'
        );
      } catch (error) {
        console.error('Failed to delete old file from Cloudinary:', error);
        // Continue with upload even if deletion fails
      }
    }

    // Extract file extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';

    // Upload new file to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadResearchPDF(
      fileBuffer,
      research.research_number,
      fileName
    );

    // Update research with new file info and tracking
    research.file_url = uploadResult.secure_url;
    research.cloudinary_public_id = uploadResult.public_id;
    research.cloudinary_secure_url = uploadResult.secure_url;
    research.file_type = fileExtension;
    research.file_updated_at = new Date();
    research.file_updated_by = updated_by_user_id;

    const savedResearch = await this.researchRepository.save(research);

    // Send notification to researcher
    try {
      await this.notificationsService.create({
        user_id: research.user_id,
        type: 'general' as any,
        title: 'تم تحديث ملف البحث',
        message: `تم تحديث ملف البحث "${research.title}" من قبل الإدارة. يمكنك تحميل النسخة المحدثة الآن.`,
      });
    } catch (error) {
      console.error('Failed to send file update notification:', error);
    }

    return savedResearch;
  }

  async uploadSupplementaryFile(
    research_id: string,
    fileBuffer: Buffer,
    fileName: string,
    fileSize: number,
    fileType: string,
    fileCategory: string
  ): Promise<ResearchFile> {
    const research = await this.findOne(research_id);

    // Upload to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadSupplementaryFile(
      fileBuffer,
      research.research_number,
      fileName
    );

    // Create file record
    const file = this.researchFileRepository.create({
      research_id,
      file_name: fileName,
      file_url: uploadResult.secure_url,
      file_type: fileType,
      file_size: fileSize,
      file_category: fileCategory as any,
      cloudinary_public_id: uploadResult.public_id,
      cloudinary_secure_url: uploadResult.secure_url,
      cloudinary_format: uploadResult.format,
      cloudinary_resource_type: uploadResult.resource_type,
    });

    return await this.researchFileRepository.save(file);
  }

  async getFileDownloadUrl(file_id: string): Promise<string> {
    const file = await this.researchFileRepository.findOne({
      where: { id: file_id },
    });

    if (!file) {
      throw new NotFoundException('الملف غير موجود');
    }

    if (file.cloudinary_public_id) {
      return this.cloudinaryService.getDownloadUrl(
        file.cloudinary_public_id,
        file.file_name
      );
    }

    return file.file_url;
  }

  async getResearchPdfDownloadUrl(research_id: string): Promise<string> {
    const research = await this.findOne(research_id);

    if (!research.cloudinary_public_id) {
      if (research.file_url) {
        return research.file_url;
      }
      throw new NotFoundException('لا يوجد ملف PDF لهذا البحث');
    }

    // Try to generate authenticated signed URL first (for old files)
    // This will work for both authenticated and public files
    try {
      return this.cloudinaryService.getAuthenticatedFileUrl(
        research.cloudinary_public_id,
        'raw',
        3600 // 1 hour
      );
    } catch (error) {
      // Fallback to regular download URL for public files
      const fileName = `${research.research_number}.pdf`;
      return this.cloudinaryService.getDownloadUrl(
        research.cloudinary_public_id,
        fileName
      );
    }
  }

  async getPdfThumbnail(
    research_id: string,
    page: number = 1
  ): Promise<string> {
    const research = await this.findOne(research_id);

    if (!research.cloudinary_public_id) {
      throw new NotFoundException('لا يوجد ملف PDF محمل على Cloudinary');
    }

    return this.cloudinaryService.getPdfThumbnail(
      research.cloudinary_public_id,
      page
    );
  }

  async getResearchPdfViewUrl(research_id: string): Promise<string> {
    const research = await this.findOne(research_id);

    if (!research.cloudinary_public_id) {
      if (research.file_url) {
        return research.file_url;
      }
      throw new NotFoundException('لا يوجد ملف PDF لهذا البحث');
    }

    // Generate authenticated signed URL for viewing
    // This works for both authenticated and public files
    return this.cloudinaryService.getAuthenticatedFileUrl(
      research.cloudinary_public_id,
      'raw',
      3600 // 1 hour
    );
  }

  /**
   * Generate acceptance certificate for a research
   */
  async generateAcceptanceCertificate(research_id: string): Promise<Research> {
    const research = await this.findOne(research_id);
    const researcher = await this.userRepository.findOne({
      where: { id: research.user_id },
    });

    if (!researcher) {
      throw new NotFoundException('الباحث غير موجود');
    }

    // Get site settings
    const siteSettings = await this.siteSettingsRepository.findOne({
      where: {},
    });

    if (!siteSettings) {
      throw new NotFoundException('إعدادات الموقع غير موجودة');
    }

    // Generate PDF certificate
    const pdfBuffer = await this.pdfGeneratorService.generateAcceptanceCertificate(
      research,
      researcher,
      siteSettings
    );

    // Upload to Cloudinary as public file
    const uploadResult = await this.cloudinaryService.uploadFile(
      pdfBuffer,
      `certificates`,
      'raw',
      {
        public_id: `${research.research_number}_acceptance_certificate`,
        format: 'pdf',
        access_mode: 'public',
        type: 'upload', // Public upload
      }
    );

    // Update research with certificate info
    research.acceptance_certificate_url = uploadResult.secure_url;
    research.acceptance_certificate_cloudinary_public_id = uploadResult.public_id;
    research.acceptance_certificate_cloudinary_secure_url = uploadResult.secure_url;

    return await this.researchRepository.save(research);
  }

  /**
   * Get acceptance certificate download URL
   */
  async getAcceptanceCertificateUrl(research_id: string): Promise<string> {
    const research = await this.findOne(research_id);

    if (!research.acceptance_certificate_cloudinary_public_id) {
      throw new NotFoundException('شهادة القبول غير متوفرة لهذا البحث');
    }

    // Return direct secure URL (public file)
    if (research.acceptance_certificate_cloudinary_secure_url) {
      return research.acceptance_certificate_cloudinary_secure_url;
    }

    // Fallback: generate download URL
    return this.cloudinaryService.getDownloadUrl(
      research.acceptance_certificate_cloudinary_public_id,
      `${research.research_number}_acceptance_certificate.pdf`
    );
  }

  /**
   * Regenerate acceptance certificate (if needed)
   */
  async regenerateAcceptanceCertificate(research_id: string): Promise<Research> {
    const research = await this.findOne(research_id);

    // Delete old certificate from Cloudinary if exists
    if (research.acceptance_certificate_cloudinary_public_id) {
      try {
        await this.cloudinaryService.deleteFile(
          research.acceptance_certificate_cloudinary_public_id,
          'raw'
        );
      } catch (error) {
        console.error('Failed to delete old certificate from Cloudinary:', error);
      }
    }

    // Generate new certificate
    return await this.generateAcceptanceCertificate(research_id);
  }
}
