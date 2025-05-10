import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
// import { CreateCommentDto } from './dto/create-comment.dto';
import { Catamaran } from '../catamarans/catamaran.entity';
import { Worker } from '../worker/entities/worker.entity';
// import { Rental } from '../rentals/rental.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async createComment(
    catamaranId: number,
    rentalId: number,
    workerId: number,
    text: string,
  ): Promise<Comment> {
    const comment = this.commentsRepository.create({
      text,
      catamaran: { id: catamaranId } as Catamaran,
      rental: { id: rentalId },
      worker: { id: workerId } as Worker,
    });
    return this.commentsRepository.save(comment);
  }
}
