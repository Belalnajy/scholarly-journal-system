import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ReviewerAssignmentsService } from './reviewer-assignments.service';
import { CreateReviewerAssignmentDto } from './dto/create-reviewer-assignment.dto';
import { UpdateReviewerAssignmentDto } from './dto/update-reviewer-assignment.dto';
import { ReviewerAssignmentStatus } from '../../database/entities/reviewer-assignment.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('reviewer-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewerAssignmentsController {
  constructor(private readonly reviewerAssignmentsService: ReviewerAssignmentsService) {}

  @Post()
  @Roles('admin', 'editor') // Only admin and editor can assign reviewers
  create(@Body() createDto: CreateReviewerAssignmentDto) {
    return this.reviewerAssignmentsService.create(createDto);
  }

  @Get()
  @Roles('researcher', 'reviewer', 'editor', 'admin') // Researchers can view assignments on their research
  findAll(
    @Query('research_id') research_id?: string,
    @Query('reviewer_id') reviewer_id?: string,
    @Query('status') status?: ReviewerAssignmentStatus,
  ) {
    return this.reviewerAssignmentsService.findAll({ research_id, reviewer_id, status });
  }

  @Get('stats/:reviewer_id')
  @Roles('reviewer', 'editor', 'admin') // Reviewers and editors can view stats
  getReviewerStats(@Param('reviewer_id') reviewer_id: string) {
    return this.reviewerAssignmentsService.getReviewerStats(reviewer_id);
  }

  @Get(':id')
  @Roles('reviewer', 'editor', 'admin') // Reviewers and editors can view assignment details
  findOne(@Param('id') id: string) {
    return this.reviewerAssignmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('reviewer', 'admin', 'editor') // Reviewers can update their assignments
  update(@Param('id') id: string, @Body() updateDto: UpdateReviewerAssignmentDto) {
    return this.reviewerAssignmentsService.update(id, updateDto);
  }

  @Patch(':id/status')
  @Roles('researcher', 'reviewer', 'admin', 'editor') // Researchers and reviewers can update assignment status
  updateStatus(@Param('id') id: string, @Body('status') status: ReviewerAssignmentStatus) {
    return this.reviewerAssignmentsService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('admin') // Only admin can delete assignments
  remove(@Param('id') id: string) {
    return this.reviewerAssignmentsService.remove(id);
  }
}
