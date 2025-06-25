import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { Worker } from './entities/worker.entity';
import { Catamaran } from '../catamarans/catamaran.entity';

@Injectable()
export class WorkerService {
  constructor(
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
    @InjectRepository(Catamaran)
    private readonly catamaranRepository: Repository<Catamaran>,
  ) {}

  create(createWorkerDto: CreateWorkerDto) {
    return this.workerRepository.save(createWorkerDto);
  }

  findAll() {
    return this.workerRepository.find();
  }

  findOne(id: number) {
    console.log('[worker.service] received id:', id);

    if (!Number.isFinite(id)) {
      throw new Error(`Неверный ID рабочего: ${id}`);
    }
    return this.workerRepository.findOne({ where: { id } });
  }

  update(id: number, updateWorkerDto: UpdateWorkerDto) {
    return this.workerRepository.update(id, updateWorkerDto);
  }

  remove(id: number) {
    return this.workerRepository.delete(id);
  }

  // Новый метод для получения списка катамаранов, созданных для рабочего
  async getCatamaransByWorkerId(workerId: number): Promise<Catamaran[]> {
    return this.catamaranRepository.find({
      where: { worker: { id: workerId } },
    });
  }
}
