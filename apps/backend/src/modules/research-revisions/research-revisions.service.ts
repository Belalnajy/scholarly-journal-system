import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResearchRevision, RevisionStatus } from '../../database/entities/research-revision.entity';
import { Research } from '../../database/entities/research.entity';
import { ReviewerAssignment } from '../../database/entities/reviewer-assignment.entity';
import { CreateRevisionDto, UpdateRevisionDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ResearchRevisionsService {
  constructor(
    @InjectRepository(ResearchRevision)
    private revisionRepository: Repository<ResearchRevision>,
    @InjectRepository(Research)
    private researchRepository: Repository<Research>,
    @InjectRepository(ReviewerAssignment)
    private reviewerAssignmentRepository: Repository<ReviewerAssignment>,
    private readonly notificationsService: NotificationsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createDto: CreateRevisionDto): Promise<ResearchRevision> {
    // Get the next revision number for this research
    const existingRevisions = await this.revisionRepository.find({
      where: { research_id: createDto.research_id },
      order: { revision_number: 'DESC' },
    });

    const revisionNumber = existingRevisions.length > 0 
      ? existingRevisions[0].revision_number + 1 
      : 1;

    const revision = this.revisionRepository.create({
      ...createDto,
      revision_number: revisionNumber,
      status: RevisionStatus.PENDING,
    });

    return await this.revisionRepository.save(revision);
  }

  async findAll(filters?: {
    research_id?: string;
    status?: RevisionStatus;
  }): Promise<ResearchRevision[]> {
    const query = this.revisionRepository.createQueryBuilder('revision')
      .leftJoinAndSelect('revision.research', 'research');

    if (filters?.research_id) {
      query.andWhere('revision.research_id = :research_id', {
        research_id: filters.research_id,
      });
    }

    if (filters?.status) {
      query.andWhere('revision.status = :status', { status: filters.status });
    }

    query.orderBy('revision.revision_number', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<ResearchRevision> {
    const revision = await this.revisionRepository.findOne({
      where: { id },
      relations: ['research'],
    });

    if (!revision) {
      throw new NotFoundException(`Revision with ID ${id} not found`);
    }

    return revision;
  }

  async update(id: string, updateDto: UpdateRevisionDto): Promise<ResearchRevision> {
    const revision = await this.findOne(id);

    Object.assign(revision, updateDto);

    return await this.revisionRepository.save(revision);
  }

  async submitRevision(id: string, file_url: string): Promise<ResearchRevision> {
    const revision = await this.update(id, {
      file_url,
      status: RevisionStatus.SUBMITTED,
      submitted_at: new Date().toISOString(),
    });

    // Send notification to reviewers and editors/admins
    try {
      const research = await this.researchRepository.findOne({
        where: { id: revision.research_id },
      });

      if (research) {
        // Get all assigned reviewers for this research
        const assignments = await this.reviewerAssignmentRepository.find({
          where: { research_id: research.id },
        });

        const reviewerIds = assignments.map(a => a.reviewer_id);

        await this.notificationsService.notifyRevisionSubmitted(
          research.id,
          research.title,
          reviewerIds,
        );
      }
    } catch (error) {
      console.error('Failed to send revision submission notification:', error);
    }

    return revision;
  }

  async approveRevision(id: string): Promise<ResearchRevision> {
    return await this.update(id, {
      status: RevisionStatus.APPROVED,
    });
  }

  async rejectRevision(id: string): Promise<ResearchRevision> {
    return await this.update(id, {
      status: RevisionStatus.REJECTED,
    });
  }

  async delete(id: string): Promise<void> {
    const revision = await this.revisionRepository.findOne({ where: { id } });
    
    if (!revision) {
      throw new NotFoundException(`Revision with ID ${id} not found`);
    }

    // Delete from Cloudinary if exists
    if (revision.cloudinary_public_id) {
      try {
        await this.cloudinaryService.deleteFile(
          revision.cloudinary_public_id,
          'raw'
        );
      } catch (error) {
        console.error('Failed to delete revision file from Cloudinary:', error);
      }
    }

    await this.revisionRepository.remove(revision);
  }

  // Upload revision file to Cloudinary
  async uploadRevisionFile(
    revision_id: string,
    fileBuffer: Buffer,
    fileName: string,
    fileSize: number
  ): Promise<ResearchRevision> {
    const revision = await this.findOne(revision_id);

    // Get research info for folder structure
    const research = await this.researchRepository.findOne({
      where: { id: revision.research_id },
    });

    if (!research) {
      throw new NotFoundException('Research not found');
    }

    // Extract file extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';

    // Delete old file if exists
    if (revision.cloudinary_public_id) {
      try {
        await this.cloudinaryService.deleteFile(
          revision.cloudinary_public_id,
          'raw'
        );
      } catch (error) {
        console.error('Failed to delete old revision file:', error);
      }
    }

    // Upload to Cloudinary with format specified
    const uploadResult = await this.cloudinaryService.uploadFile(
      fileBuffer,
      `research/revisions/${research.research_number}/revision-${revision.revision_number}`,
      'raw',
      {
        public_id: `revision-${revision.revision_number}`,
        format: fileExtension,
        access_mode: 'public',
      }
    );

    // Store original data before updating
    if (!revision.original_data) {
      revision.original_data = {
        file_url: research.file_url,
        cloudinary_public_id: research.cloudinary_public_id,
        cloudinary_secure_url: research.cloudinary_secure_url,
        file_type: research.file_type,
      };
    }

    // Update revision with Cloudinary info and file type
    revision.file_url = uploadResult.secure_url;
    revision.cloudinary_public_id = uploadResult.public_id;
    revision.cloudinary_secure_url = uploadResult.secure_url;
    revision.file_type = fileExtension;
    revision.status = RevisionStatus.SUBMITTED;
    revision.submitted_at = new Date();

    const updatedRevision = await this.revisionRepository.save(revision);

    // Send notification
    try {
      const research = await this.researchRepository.findOne({
        where: { id: revision.research_id },
      });

      if (research) {
        const assignments = await this.reviewerAssignmentRepository.find({
          where: { research_id: research.id },
        });

        const reviewerIds = assignments.map(a => a.reviewer_id);

        await this.notificationsService.notifyRevisionSubmitted(
          research.id,
          research.title,
          reviewerIds,
        );
      }
    } catch (error) {
      console.error('Failed to send revision submission notification:', error);
    }

    return updatedRevision;
  }

  // Get download URL for revision file
  async getRevisionDownloadUrl(revision_id: string): Promise<string> {
    const revision = await this.findOne(revision_id);

    if (!revision.cloudinary_public_id) {
      if (revision.file_url) {
        return revision.file_url;
      }
      throw new NotFoundException('No file found for this revision');
    }

    return this.cloudinaryService.getDownloadUrl(
      revision.cloudinary_public_id,
      `revision-${revision.revision_number}.pdf`
    );
  }
}
