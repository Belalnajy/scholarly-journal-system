import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public() // Allow public registration
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('editors')
  @Public() // Public endpoint for editorial board page
  async getEditors() {
    return this.usersService.getEditors();
  }

  @Get()
  @Roles('admin', 'editor') // Only admin and editor can view all users
  findAll() {
    return this.usersService.findAll();
  }

  @Get('stats')
  @Roles('admin', 'editor') // Only admin and editor can view stats
  getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'editor') // Only admin and editor can update users (or add logic to allow users to update themselves)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin') // Only admin can delete users
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/verify-password')
  async verifyPassword(
    @Param('id') id: string,
    @Body() body: { password: string },
  ) {
    if (!body.password) {
      throw new Error('Password is required');
    }
    return this.usersService.verifyPassword(id, body.password);
  }

  // Avatar endpoints
  @Post(':id/upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(userId, file.buffer);
  }

  @Delete(':id/avatar')
  deleteAvatar(@Param('id') userId: string) {
    return this.usersService.deleteAvatar(userId);
  }

  @Get(':id/avatar-url')
  getAvatarUrl(
    @Param('id') userId: string,
    @Query('width') width?: string,
    @Query('height') height?: string,
  ) {
    const w = width ? parseInt(width, 10) : undefined;
    const h = height ? parseInt(height, 10) : undefined;
    return this.usersService.getAvatarUrl(userId, w, h);
  }
}
