import { PartialType } from '@nestjs/mapped-types';
import { CreateContactSubmissionDto } from './create-contact-submission.dto';

export class UpdateContactSubmissionDto extends PartialType(CreateContactSubmissionDto) {}
