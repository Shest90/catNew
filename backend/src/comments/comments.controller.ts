// backend/src/comments/comments.controller.ts
import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Request } from 'express';

@Controller('worker/catamarans/:catamaranId/rentals/:rentalId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(
    @Param('catamaranId') catamaranId: string,
    @Param('rentalId') rentalId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const workerId = (req.user as any).id as number;
    return this.commentsService.createComment(
      +catamaranId,
      +rentalId,
      workerId,
      dto.text,
    );
  }
}
