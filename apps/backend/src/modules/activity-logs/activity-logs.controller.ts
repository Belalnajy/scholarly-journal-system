import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';

@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  /**
   * POST /activity-logs
   * Create a new activity log
   */
  @Post()
  create(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.activityLogsService.create(createActivityLogDto);
  }

  /**
   * GET /activity-logs
   * Get all activity logs with optional filters
   * Query params: user_id, research_id, action_type, limit
   */
  @Get()
  findAll(
    @Query('user_id') user_id?: string,
    @Query('research_id') research_id?: string,
    @Query('action_type') action_type?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityLogsService.findAll({
      user_id,
      research_id,
      action_type,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * GET /activity-logs/stats
   * Get activity statistics
   */
  @Get('stats')
  getStats() {
    return this.activityLogsService.getStats();
  }

  /**
   * GET /activity-logs/user/:userId
   * Get activity logs by user
   */
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.activityLogsService.findByUser(userId, limit ? parseInt(limit, 10) : 50);
  }

  /**
   * GET /activity-logs/research/:researchId
   * Get activity logs by research
   */
  @Get('research/:researchId')
  findByResearch(@Param('researchId') researchId: string) {
    return this.activityLogsService.findByResearch(researchId);
  }

  /**
   * GET /activity-logs/:id
   * Get one activity log by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityLogsService.findOne(id);
  }

  /**
   * PATCH /activity-logs/:id
   * Update an activity log
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActivityLogDto: UpdateActivityLogDto) {
    return this.activityLogsService.update(id, updateActivityLogDto);
  }

  /**
   * DELETE /activity-logs/:id
   * Delete an activity log
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityLogsService.remove(id);
  }
}
