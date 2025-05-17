// backend/src/report/report.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rental } from '../rentals/rental.entity';
import { Repository, Between } from 'typeorm';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { ReportItemDto } from './dto/report-item.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Rental)
    private readonly rentRepo: Repository<Rental>,
  ) {}

  async getWorkerReport(
    workerId: number,
    filter: ReportFilterDto,
  ): Promise<ReportResponseDto> {
    const start = new Date(filter.startDate);
    const end = new Date(filter.endDate);
    end.setHours(23, 59, 59, 999);

    const rentals = await this.rentRepo.find({
      where: {
        worker: { id: workerId },
        startTime: Between(start, end),
      },
      relations: ['catamaran', 'comments'],
      order: { startTime: 'DESC' },
    });

    const items: ReportItemDto[] = rentals.map((r) => ({
      catamaranName: r.catamaran.name,
      startAt: r.startTime,
      endAt: r.endTime!,
      durationMinutes: r.durationMinutes,
      count: r.count,
      comments: r.comments.map((c) => c.text),
      // ← здесь передаём индивидуальный лимит, если он есть
      timerLimitMinutes: r.catamaran.timerLimitMinutes ?? null,
    }));

    const totalRentals = items.reduce((sum, it) => sum + it.count, 0);
    return { items, totalRentals };
  }
}
