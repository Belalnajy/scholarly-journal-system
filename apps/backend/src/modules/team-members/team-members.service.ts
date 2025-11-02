import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from '../../database/entities/team-member.entity';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
  ) {}

  /**
   * Create a new team member
   */
  async create(createDto: CreateTeamMemberDto): Promise<TeamMember> {
    const member = this.teamMemberRepository.create(createDto);
    return await this.teamMemberRepository.save(member);
  }

  /**
   * Get all team members
   */
  async findAll(sectionId?: string): Promise<TeamMember[]> {
    const query = this.teamMemberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.section', 'section')
      .orderBy('member.display_order', 'ASC');

    if (sectionId) {
      query.where('member.section_id = :sectionId', { sectionId });
    }

    return await query.getMany();
  }

  /**
   * Get a single team member by ID
   */
  async findOne(id: string): Promise<TeamMember> {
    const member = await this.teamMemberRepository.findOne({
      where: { id },
      relations: ['section'],
    });

    if (!member) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }

    return member;
  }

  /**
   * Update a team member
   */
  async update(id: string, updateDto: UpdateTeamMemberDto): Promise<TeamMember> {
    // Update the member directly
    const result = await this.teamMemberRepository.update(id, updateDto);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
    
    // Fetch the updated member with fresh relations using a new query
    const updatedMember = await this.teamMemberRepository.findOne({
      where: { id },
      relations: ['section'],
    });
    
    if (!updatedMember) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
    
    return updatedMember;
  }

  /**
   * Delete a team member
   */
  async remove(id: string): Promise<void> {
    const member = await this.findOne(id);
    await this.teamMemberRepository.remove(member);
  }

  /**
   * Reorder members within a section
   */
  async reorder(memberIds: string[]): Promise<void> {
    for (let i = 0; i < memberIds.length; i++) {
      await this.teamMemberRepository.update(memberIds[i], {
        display_order: i,
      });
    }
  }

  /**
   * Upload member image
   */
  async updateImage(id: string, imageUrl: string): Promise<TeamMember> {
    const member = await this.findOne(id);
    member.image_url = imageUrl;
    return await this.teamMemberRepository.save(member);
  }
}
