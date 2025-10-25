import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicationFieldDto } from './create-publication-field.dto';

export class UpdatePublicationFieldDto extends PartialType(
  CreatePublicationFieldDto,
) {}
