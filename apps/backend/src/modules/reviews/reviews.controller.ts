import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewStatus } from '../../database/entities/review.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Roles('reviewer', 'admin', 'editor') // Only reviewers can create reviews
  create(@Body() createDto: CreateReviewDto) {
    return this.reviewsService.create(createDto);
  }

  @Get()
  @Roles('researcher', 'reviewer', 'editor', 'admin') // Researchers can view reviews on their research
  findAll(
    @Query('research_id') research_id?: string,
    @Query('reviewer_id') reviewer_id?: string,
    @Query('status') status?: ReviewStatus,
  ) {
    return this.reviewsService.findAll({ research_id, reviewer_id, status });
  }

  @Get('stats/:research_id')
  @Roles('researcher', 'editor', 'admin') // Researchers, editors and admins can view review stats
  getResearchReviewsStats(@Param('research_id') research_id: string) {
    return this.reviewsService.getResearchReviewsStats(research_id);
  }

  @Get(':id')
  @Roles('reviewer', 'editor', 'admin') // Reviewers and editors can view review details
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @Roles('reviewer', 'admin', 'editor') // Reviewers can update their own reviews
  update(@Param('id') id: string, @Body() updateDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateDto);
  }

  @Patch(':id/status')
  @Roles('researcher', 'admin', 'editor') // Researchers can reset review status when submitting revisions
  updateStatus(@Param('id') id: string, @Body('status') status: ReviewStatus) {
    return this.reviewsService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('admin') // Only admin can delete reviews
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
