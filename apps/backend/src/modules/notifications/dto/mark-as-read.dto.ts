import { IsBoolean } from 'class-validator';

export class MarkAsReadDto {
  @IsBoolean({ message: 'حالة القراءة يجب أن تكون قيمة منطقية' })
  is_read!: boolean;
}
