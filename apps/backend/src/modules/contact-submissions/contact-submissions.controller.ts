import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ContactSubmissionsService } from './contact-submissions.service';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';
import { UpdateContactSubmissionDto } from './dto/update-contact-submission.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ContactSubmissionStatus } from '../../database/entities/contact-submission.entity';

@Controller('contact-submissions')
export class ContactSubmissionsController {
  constructor(private readonly contactSubmissionsService: ContactSubmissionsService) {}

  /**
   * POST /contact-submissions
   * Create a new contact submission
   */
  @Post()
  create(@Body() createContactSubmissionDto: CreateContactSubmissionDto) {
    return this.contactSubmissionsService.create(createContactSubmissionDto);
  }

  /**
   * GET /contact-submissions
   * Get all contact submissions with optional filters
   * Query params: status, user_id
   */
  @Get()
  findAll(
    @Query('status') status?: ContactSubmissionStatus,
    @Query('user_id') user_id?: string,
  ) {
    return this.contactSubmissionsService.findAll({ status, user_id });
  }

  /**
   * GET /contact-submissions/stats
   * Get contact submissions statistics
   */
  @Get('stats')
  getStats() {
    return this.contactSubmissionsService.getStats();
  }

  /**
   * GET /contact-submissions/pending-count
   * Get pending submissions count
   */
  @Get('pending-count')
  getPendingCount() {
    return this.contactSubmissionsService.getPendingCount();
  }

  /**
   * GET /contact-submissions/user/:userId
   * Get submissions by user
   */
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.contactSubmissionsService.findByUser(userId);
  }

  /**
   * PATCH /contact-submissions/:id/status
   * Update submission status
   */
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.contactSubmissionsService.updateStatus(id, updateStatusDto.status);
  }

  /**
   * GET /contact-submissions/:id
   * Get one contact submission by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactSubmissionsService.findOne(id);
  }

  /**
   * PATCH /contact-submissions/:id
   * Update a contact submission
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactSubmissionDto: UpdateContactSubmissionDto) {
    return this.contactSubmissionsService.update(id, updateContactSubmissionDto);
  }

  /**
   * DELETE /contact-submissions/:id
   * Delete a contact submission
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactSubmissionsService.remove(id);
  }
}
