import { PartialType } from '@nestjs/mapped-types';
import { CreateCatamaranDto } from './create-catamaran.dto';

export class UpdateCatamaranDto extends PartialType(CreateCatamaranDto) {}
