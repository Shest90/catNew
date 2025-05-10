// backend/src/report/report.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rental } from '../rentals/rental.entity';
import { Repository } from 'typeorm';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ReportResponseDto, ReportItemDto } from './dto/report-response.dto';

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
    // 1) Преобразуем строки в Date и расширяем конец дня
    const start = new Date(filter.startDate);
    const end = new Date(filter.endDate);
    end.setHours(23, 59, 59, 999);

    // 2) Собираем запрос
    const qb = this.rentRepo
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.catamaran', 'c')
      .innerJoin('c.worker', 'w')
      .leftJoinAndSelect('r.comments', 'cm')
      .where('w.id = :workerId', { workerId })
      .andWhere('r.startTime BETWEEN :start AND :end', { start, end });

    if (filter.catamarans && filter.catamarans.length > 0) {
      const likeClauses = filter.catamarans
        .map((_, idx) => `c.name LIKE :name${idx}`)
        .join(' OR ');
      // параметры вида { name0: '%foo%', name1: '%bar%' }
      const params = filter.catamarans.reduce(
        (acc, name, idx) => {
          acc[`name${idx}`] = `%${name}%`;
          return acc;
        },
        {} as Record<string, string>,
      );
      qb.andWhere(`(${likeClauses})`, params);
    }

    // 3) Получаем сами сущности
    const rentals = await qb.orderBy('r.startTime', 'DESC').getMany();

    // 4) Преобразовываем в DTO
    const items: ReportItemDto[] = rentals.map((r) => ({
      catamaranName: r.catamaran.name,
      startAt: r.startTime,
      endAt: r.endTime!,
      durationMinutes: r.durationMinutes,
      count: r.count,
      comments: r.comments.map((c) => c.text),
    }));

    // 5) Считаем общее число прокатов
    const totalRentals = items.reduce((sum, it) => sum + it.count, 0);

    return { items, totalRentals };
  }
}
