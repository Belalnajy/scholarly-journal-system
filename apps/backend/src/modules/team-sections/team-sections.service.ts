import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamSection } from '../../database/entities/team-section.entity';
import { CreateTeamSectionDto } from './dto/create-team-section.dto';
import { UpdateTeamSectionDto } from './dto/update-team-section.dto';

@Injectable()
export class TeamSectionsService {
  constructor(
    @InjectRepository(TeamSection)
    private teamSectionRepository: Repository<TeamSection>,
  ) {}

  /**
   * Create a new team section
   */
  async create(createDto: CreateTeamSectionDto): Promise<TeamSection> {
    const section = this.teamSectionRepository.create(createDto);
    return await this.teamSectionRepository.save(section);
  }

  /**
   * Get all team sections with their members
   */
  async findAll(includeInactive = false): Promise<TeamSection[]> {
    const query = this.teamSectionRepository
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.members', 'member')
      .orderBy('section.display_order', 'ASC')
      .addOrderBy('member.display_order', 'ASC');

    if (!includeInactive) {
      query.where('section.is_active = :active', { active: true });
      query.andWhere('member.is_active = :memberActive', { memberActive: true });
    }

    return await query.getMany();
  }

  /**
   * Get all sections for public view (only active sections with active members)
   */
  async findAllPublic(): Promise<TeamSection[]> {
    return await this.teamSectionRepository
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.members', 'member', 'member.is_active = :memberActive', {
        memberActive: true,
      })
      .where('section.is_active = :active', { active: true })
      .orderBy('section.display_order', 'ASC')
      .addOrderBy('member.display_order', 'ASC')
      .getMany();
  }

  /**
   * Get a single team section by ID
   */
  async findOne(id: string): Promise<TeamSection> {
    const section = await this.teamSectionRepository.findOne({
      where: { id },
      relations: ['members'],
      order: {
        members: {
          display_order: 'ASC',
        },
      },
    });

    if (!section) {
      throw new NotFoundException(`Team section with ID ${id} not found`);
    }

    return section;
  }

  /**
   * Update a team section
   */
  async update(id: string, updateDto: UpdateTeamSectionDto): Promise<TeamSection> {
    const section = await this.findOne(id);
    Object.assign(section, updateDto);
    return await this.teamSectionRepository.save(section);
  }

  /**
   * Delete a team section
   */
  async remove(id: string): Promise<void> {
    const section = await this.findOne(id);
    await this.teamSectionRepository.remove(section);
  }

  /**
   * Reorder sections
   */
  async reorder(sectionIds: string[]): Promise<void> {
    for (let i = 0; i < sectionIds.length; i++) {
      await this.teamSectionRepository.update(sectionIds[i], {
        display_order: i,
      });
    }
  }
}
