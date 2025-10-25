import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PublicationFieldsService } from './publication-fields.service';
import { CreatePublicationFieldDto } from './dto/create-publication-field.dto';
import { UpdatePublicationFieldDto } from './dto/update-publication-field.dto';

@Controller('publication-fields')
export class PublicationFieldsController {
  constructor(
    private readonly publicationFieldsService: PublicationFieldsService,
  ) {}

  /**
   * Create a new publication field
   */
  @Post()
  create(@Body() createPublicationFieldDto: CreatePublicationFieldDto) {
    return this.publicationFieldsService.create(createPublicationFieldDto);
  }

  /**
   * Get all publication fields
   */
  @Get()
  findAll() {
    return this.publicationFieldsService.findAll();
  }

  /**
   * Get active publication fields only
   */
  @Get('active')
  findActive() {
    return this.publicationFieldsService.findActive();
  }

  /**
   * Get statistics
   */
  @Get('stats')
  getStats() {
    return this.publicationFieldsService.getStats();
  }

  /**
   * Get one publication field
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicationFieldsService.findOne(id);
  }

  /**
   * Update a publication field
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePublicationFieldDto: UpdatePublicationFieldDto,
  ) {
    return this.publicationFieldsService.update(id, updatePublicationFieldDto);
  }

  /**
   * Delete a publication field
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publicationFieldsService.remove(id);
  }

  /**
   * Toggle active status
   */
  @Post(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.publicationFieldsService.toggleActive(id);
  }

  /**
   * Reorder publication fields
   */
  @Post('reorder')
  reorder(@Body() body: { orderedIds: string[] }) {
    return this.publicationFieldsService.reorder(body.orderedIds);
  }
}
