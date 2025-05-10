// src/rentals/rentals.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rental } from './rental.entity';
import { FinishRentalDto } from './dto/finish-rental.dto';
import { Catamaran } from '../catamarans/catamaran.entity';
import { Worker } from '../worker/entities/worker.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class RentalsService {
  constructor(
    @InjectRepository(Rental)
    private readonly repo: Repository<Rental>,
    @InjectRepository(Catamaran)
    private readonly catRepo: Repository<Catamaran>,
    private readonly mailer: MailerService,
  ) {}

  /** Начать новую сессию проката */
  async startRental(
    catamaranId: number,
    workerId: number,
    count?: number,
  ): Promise<Rental> {
    // 1) создаём и сохраняем rental
    const rental = this.repo.create({
      startTime: new Date(),
      durationMinutes: 0,
      count: count ?? 1,
      catamaran: { id: catamaranId } as Catamaran,
      worker: { id: workerId } as Worker,
    });
    const saved = await this.repo.save(rental);

    // 2) подгружаем катамаран вместе с рабочим и его администратором
    const cat = await this.catRepo.findOne({
      where: { id: catamaranId },
      relations: ['worker', 'worker.admin'],
    });
    if (cat?.notifyOnStart && cat.worker?.admin?.email) {
      // 3) отправляем письмо через MailerService
      await this.mailer.sendMail({
        to: cat.worker.admin.email,
        subject: `Начался прокат катамарана "${cat.name}"`,
        template: 'rental-start', // файл шаблона: email-templates/rental-start.hbs
        context: {
          catamaranName: cat.name,
          workerName: cat.worker.username,
          startTime: saved.startTime.toLocaleString(),
        },
      });
    }

    return saved;
  }

  /** Завершить прокат, записать длительность и число прокатов (count) */
  async finishRental(id: number, dto: FinishRentalDto): Promise<Rental> {
    const rental = await this.repo.findOne({ where: { id } });
    if (!rental) throw new NotFoundException('Rental not found');
    rental.endTime = new Date(dto.endTime);
    rental.durationMinutes = dto.durationMinutes;
    rental.count = dto.count;
    return this.repo.save(rental);
  }
  /** История прокатов для катамарана */
  findByCatamaran(catId: number): Promise<Rental[]> {
    return this.repo.find({
      where: { catamaran: { id: catId } },
      order: { startTime: 'DESC' },
    });
  }

  // … другие методы для отчётов …
}
