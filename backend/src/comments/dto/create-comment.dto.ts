// backend/src/comments/dto/create-comment.dto.ts
import { IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  text!: string;
}
