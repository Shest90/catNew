import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Catamaran } from './catamaran.entity';
import { Repository } from 'typeorm';
import { CreateCatamaranDto } from './dto/create-catamaran.dto';
import { UpdateCatamaranDto } from './dto/update-catamaran.dto';

import { Worker } from '../worker/entities/worker.entity';

@Injectable()
export class CatamaransService {
  constructor(
    @InjectRepository(Catamaran)
    private catamaranRepository: Repository<Catamaran>,
    @InjectRepository(Worker)
    private workerRepository: Repository<Worker>,
  ) {}

  async createCatamaran(
    workerId: number,
    dto: CreateCatamaranDto,
  ): Promise<Catamaran> {
    const worker = await this.workerRepository.findOne({
      where: { id: workerId },
    });
    if (!worker) throw new NotFoundException('Рабочий не найден');
    // const partial: Partial<Catamaran> = {
    //   name: dto.name,
    //   worker,
    // };
    // if (dto.timerLimitMinutes !== undefined) {
    //   partial.timerLimitMinutes = dto.timerLimitMinutes;
    // }

    const catamaran = this.catamaranRepository.create({
      ...dto, // name, timerLimitMinutes, notifyOnStart
      worker,
    });
    return this.catamaranRepository.save(catamaran);
  }

  async getCatamaransByWorkerId(workerId: number): Promise<Catamaran[]> {
    return await this.catamaranRepository.find({
      where: { worker: { id: workerId } },
    });
  }
  async updateCatamaran(
    workerId: number,
    catId: number,
    dto: UpdateCatamaranDto,
  ): Promise<Catamaran> {
    const cat = await this.catamaranRepository.findOne({
      where: { id: catId, worker: { id: workerId } },
    });
    if (!cat) throw new NotFoundException('Catamaran not found');
    Object.assign(cat, dto);
    return this.catamaranRepository.save(cat);
  }

  async removeCatamaran(
    workerId: number,
    catamaranId: number,
  ): Promise<{ deleted: true }> {
    const cat = await this.catamaranRepository.findOne({
      where: { id: catamaranId, worker: { id: workerId } },
    });
    if (!cat) {
      throw new NotFoundException('Катамаран не найден');
    }
    await this.catamaranRepository.remove(cat);
    return { deleted: true };
  }
}
