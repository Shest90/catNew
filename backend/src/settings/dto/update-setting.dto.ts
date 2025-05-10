// src/settings/dto/update-setting.dto.ts
import { IsInt, Min } from 'class-validator';

export class UpdateSettingDto {
  @IsInt()
  @Min(0)
  weekdayLimit: number;

  @IsInt()
  @Min(0)
  weekendLimit: number;
}
