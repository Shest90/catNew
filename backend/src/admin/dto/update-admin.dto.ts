import { PartialType } from '@nestjs/mapped-types';
import { RegisterAdminDto } from './create-admin.dto';

export class UpdateAdminDto extends PartialType(RegisterAdminDto) {}
