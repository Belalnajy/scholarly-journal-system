import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicationField } from '../../database/entities/publication-field.entity';
import { CreatePublicationFieldDto } from './dto/create-publication-field.dto';
import { UpdatePublicationFieldDto } from './dto/update-publication-field.dto';

@Injectable()
export class PublicationFieldsService {
  constructor(
    @InjectRepository(PublicationField)
    private readonly publicationFieldRepository: Repository<PublicationField>,
  ) {}

  /**
   * Create a new publication field
   */
  async create(
    createPublicationFieldDto: CreatePublicationFieldDto,
  ): Promise<PublicationField> {
    // Check if field with same Arabic name already exists
    const existingField = await this.publicationFieldRepository.findOne({
      where: { name_ar: createPublicationFieldDto.name_ar },
    });

    if (existingField) {
      throw new ConflictException('مجال النشر موجود بالفعل');
    }

    const field = this.publicationFieldRepository.create(
      createPublicationFieldDto,
    );
    return await this.publicationFieldRepository.save(field);
  }

  /**
   * Get all publication fields
   */
  async findAll(): Promise<PublicationField[]> {
    return await this.publicationFieldRepository.find({
      order: {
        display_order: 'ASC',
        name_ar: 'ASC',
      },
    });
  }

  /**
   * Get active publication fields only
   */
  async findActive(): Promise<PublicationField[]> {
    return await this.publicationFieldRepository.find({
      where: { is_active: true },
      order: {
        display_order: 'ASC',
        name_ar: 'ASC',
      },
    });
  }

  /**
   * Get one publication field by ID
   */
  async findOne(id: string): Promise<PublicationField> {
    const field = await this.publicationFieldRepository.findOne({
      where: { id },
    });

    if (!field) {
      throw new NotFoundException('مجال النشر غير موجود');
    }

    return field;
  }

  /**
   * Update a publication field
   */
  async update(
    id: string,
    updatePublicationFieldDto: UpdatePublicationFieldDto,
  ): Promise<PublicationField> {
    const field = await this.findOne(id);

    // Check if updating to a name that already exists
    if (
      updatePublicationFieldDto.name_ar &&
      updatePublicationFieldDto.name_ar !== field.name_ar
    ) {
      const existingField = await this.publicationFieldRepository.findOne({
        where: { name_ar: updatePublicationFieldDto.name_ar },
      });

      if (existingField) {
        throw new ConflictException('مجال النشر موجود بالفعل');
      }
    }

    Object.assign(field, updatePublicationFieldDto);
    return await this.publicationFieldRepository.save(field);
  }

  /**
   * Delete a publication field
   */
  async remove(id: string): Promise<void> {
    const field = await this.findOne(id);
    await this.publicationFieldRepository.remove(field);
  }

  /**
   * Toggle active status
   */
  async toggleActive(id: string): Promise<PublicationField> {
    const field = await this.findOne(id);
    field.is_active = !field.is_active;
    return await this.publicationFieldRepository.save(field);
  }

  /**
   * Reorder publication fields
   */
  async reorder(orderedIds: string[]): Promise<PublicationField[]> {
    const fields = await Promise.all(
      orderedIds.map(async (id, index) => {
        const field = await this.findOne(id);
        field.display_order = index;
        return await this.publicationFieldRepository.save(field);
      }),
    );

    return fields;
  }

  /**
   * Get statistics
   */
  async getStats() {
    const total = await this.publicationFieldRepository.count();
    const active = await this.publicationFieldRepository.count({
      where: { is_active: true },
    });
    const inactive = total - active;

    return {
      total,
      active,
      inactive,
    };
  }
}
