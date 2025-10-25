import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class CreatePublicationFieldDto {
  @IsNotEmpty({ message: 'الاسم بالعربية مطلوب' })
  @IsString()
  name_ar!: string;

  @IsOptional()
  @IsString()
  name_en?: string;

  @IsOptional()
  @IsString()
  description_ar?: string;

  @IsOptional()
  @IsString()
  description_en?: string;

  @IsOptional()
  @IsInt()
  display_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
