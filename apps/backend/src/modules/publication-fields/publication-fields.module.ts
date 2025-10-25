import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationFieldsService } from './publication-fields.service';
import { PublicationFieldsController } from './publication-fields.controller';
import { PublicationField } from '../../database/entities/publication-field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PublicationField])],
  controllers: [PublicationFieldsController],
  providers: [PublicationFieldsService],
  exports: [PublicationFieldsService],
})
export class PublicationFieldsModule {}
