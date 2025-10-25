import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewerAssignmentDto } from './create-reviewer-assignment.dto';

export class UpdateReviewerAssignmentDto extends PartialType(CreateReviewerAssignmentDto) {}
