import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TeamMembersService } from './team-members.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('team-members')
export class TeamMembersController {
  constructor(
    private readonly teamMembersService: TeamMembersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Create a new team member (Admin only)
   * POST /api/team-members
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createDto: CreateTeamMemberDto) {
    return this.teamMembersService.create(createDto);
  }

  /**
   * Get all team members (optionally filter by section)
   * GET /api/team-members?sectionId=xxx
   */
  @Get()
  findAll(@Query('sectionId') sectionId?: string) {
    return this.teamMembersService.findAll(sectionId);
  }

  /**
   * Get a single team member by ID
   * GET /api/team-members/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamMembersService.findOne(id);
  }

  /**
   * Update a team member (Admin only)
   * PATCH /api/team-members/:id
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateDto: UpdateTeamMemberDto) {
    return this.teamMembersService.update(id, updateDto);
  }

  /**
   * Delete a team member (Admin only)
   * DELETE /api/team-members/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.teamMembersService.remove(id);
  }

  /**
   * Reorder members (Admin only)
   * PATCH /api/team-members/reorder
   */
  @Patch('reorder/members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reorder(@Body() body: { memberIds: string[] }) {
    return this.teamMembersService.reorder(body.memberIds);
  }

  /**
   * Upload member image (Admin only)
   * POST /api/team-members/:id/upload-image
   */
  @Post(':id/upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    // Upload to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadFile(file.buffer, 'team-members', 'image');
    
    // Update member with new image URL
    return await this.teamMembersService.updateImage(id, uploadResult.secure_url);
  }
}
