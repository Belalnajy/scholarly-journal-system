import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * POST /notifications
   * Create a new notification
   */
  @Post()
  @Roles('admin', 'editor') // Only admin and editor can create notifications
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  /**
   * GET /notifications
   * Get all notifications with optional filters
   * Query params: user_id, is_read, type
   */
  @Get()
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can view their notifications
  findAll(
    @Query('user_id') user_id?: string,
    @Query('is_read') is_read?: string,
    @Query('type') type?: string,
  ) {
    return this.notificationsService.findAll({
      user_id,
      is_read: is_read !== undefined ? is_read === 'true' : undefined,
      type,
    });
  }

  /**
   * GET /notifications/user/:userId
   * Get notifications by user
   */
  @Get('user/:userId')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can view their notifications
  findByUser(@Param('userId') userId: string) {
    return this.notificationsService.findByUser(userId);
  }

  /**
   * GET /notifications/user/:userId/unread-count
   * Get unread notifications count for a user
   */
  @Get('user/:userId/unread-count')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can view their unread count
  getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  /**
   * PATCH /notifications/:id/read
   * Mark a notification as read
   */
  @Patch(':id/read')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can mark their notifications as read
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  /**
   * PATCH /notifications/read-all
   * Mark all notifications as read for current user
   */
  @Patch('read-all')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can mark all their notifications as read
  markAllAsRead(@Query('user_id') userId?: string) {
    // In production, get userId from authenticated user
    // For now, we'll use query param or get from request
    return this.notificationsService.markAllAsRead(userId);
  }

  /**
   * GET /notifications/unread/count
   * Get unread notifications count
   */
  @Get('unread/count')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can view their unread count
  getUnreadCountForCurrentUser(@Query('user_id') userId?: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  /**
   * DELETE /notifications/read
   * Remove all read notifications
   */
  @Delete('read')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can delete their read notifications
  removeAllRead(@Query('user_id') userId?: string) {
    return this.notificationsService.removeAllRead(userId);
  }

  /**
   * GET /notifications/:id
   * Get one notification by ID
   */
  @Get(':id')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can view their notifications
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  /**
   * PATCH /notifications/:id
   * Update a notification
   */
  @Patch(':id')
  @Roles('admin', 'editor') // Only admin and editor can update notifications
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  /**
   * DELETE /notifications/:id
   * Delete a notification
   */
  @Delete(':id')
  @Roles('researcher', 'reviewer', 'editor', 'admin') // All authenticated users can delete their notifications
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  /**
   * POST /notifications/broadcast
   * Broadcast notification to all users (Admin only)
   * إرسال إشعار لجميع المستخدمين (للمسؤولين فقط)
   */
  @Post('broadcast')
  @Roles('admin') // Only admin can broadcast notifications
  broadcastToAll(@Body() broadcastDto: BroadcastNotificationDto) {
    return this.notificationsService.broadcastToAll(broadcastDto);
  }
}
