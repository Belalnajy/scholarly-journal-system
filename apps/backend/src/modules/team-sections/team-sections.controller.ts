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
} from '@nestjs/common';
import { TeamSectionsService } from './team-sections.service';
import { CreateTeamSectionDto } from './dto/create-team-section.dto';
import { UpdateTeamSectionDto } from './dto/update-team-section.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('team-sections')
export class TeamSectionsController {
  constructor(private readonly teamSectionsService: TeamSectionsService) {}

  /**
   * Create a new team section (Admin only)
   * POST /api/team-sections
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createDto: CreateTeamSectionDto) {
    return this.teamSectionsService.create(createDto);
  }

  /**
   * Get all team sections (Public - only active sections)
   * GET /api/team-sections
   */
  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    // If includeInactive is provided, it's an admin request
    if (includeInactive === 'true') {
      return this.teamSectionsService.findAll(true);
    }
    return this.teamSectionsService.findAllPublic();
  }

  /**
   * Get all sections for admin (including inactive)
   * GET /api/team-sections/admin/all
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAllForAdmin() {
    return this.teamSectionsService.findAll(true);
  }

  /**
   * Get a single team section by ID
   * GET /api/team-sections/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamSectionsService.findOne(id);
  }

  /**
   * Update a team section (Admin only)
   * PATCH /api/team-sections/:id
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateDto: UpdateTeamSectionDto) {
    return this.teamSectionsService.update(id, updateDto);
  }

  /**
   * Delete a team section (Admin only)
   * DELETE /api/team-sections/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.teamSectionsService.remove(id);
  }

  /**
   * Reorder sections (Admin only)
   * PATCH /api/team-sections/reorder
   */
  @Patch('reorder/sections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reorder(@Body() body: { sectionIds: string[] }) {
    return this.teamSectionsService.reorder(body.sectionIds);
  }
}
