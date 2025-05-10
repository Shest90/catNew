import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { Worker } from '../worker/entities/worker.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Worker)
    private workerRepository: Repository<Worker>,
  ) {}

  async create(createAdminDto: RegisterAdminDto): Promise<Admin> {
    const admin = this.adminRepository.create(createAdminDto);
    return this.adminRepository.save(admin);
  }
  async findAll(): Promise<Admin[]> {
    return this.adminRepository.find();
  }

  async findOne(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) throw new NotFoundException(`Admin #${id} not found`);
    return admin;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    await this.adminRepository.update(id, updateAdminDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.adminRepository.delete(id);
  }

  async getWorkersByAdminId(adminId: number): Promise<Worker[]> {
    // Предполагается, что в сущности Worker есть связь с администратором через поле admin
    return this.workerRepository.find({
      where: { admin: { id: adminId } },
    });
  }

  async deleteWorker(adminId: number, workerId: number): Promise<any> {
    // Проверяем, что рабочий принадлежит данному администратору
    const worker = await this.workerRepository.findOne({
      where: { id: workerId, admin: { id: adminId } },
    });
    if (!worker) {
      throw new NotFoundException(
        'Рабочий не найден или не принадлежит данному администратору.',
      );
    }
    return await this.workerRepository.delete(workerId);
  }
}
