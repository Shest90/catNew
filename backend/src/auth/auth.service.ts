// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../admin/entities/admin.entity';
import { Worker } from '../worker/entities/worker.entity';
import { RegisterAdminDto } from '../admin/dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Worker)
    private workerRepository: Repository<Worker>,
    private jwtService: JwtService,
  ) {}

  // Регистрация администратора
  async registerAdmin(dto: RegisterAdminDto): Promise<Admin> {
    const { username, email, password } = dto;

    // проверяем, что email или username не заняты
    const exists = await this.adminRepository.findOne({
      where: [{ email }, { username }],
    });
    if (exists) {
      throw new ConflictException('Username or email already in use');
    }
    const hash = await bcrypt.hash(password, 10);
    const admin = this.adminRepository.create({
      username,
      email,
      password: hash,
    });
    return await this.adminRepository.save(admin);
  }

  // Создание рабочего администратором
  async createWorker(
    adminId: number,
    username: string,
    password: string,
  ): Promise<Worker> {
    const hash = await bcrypt.hash(password, 10);
    const worker = this.workerRepository.create({
      username,
      password: hash,
      admin: { id: adminId } as Admin,
    });
    return await this.workerRepository.save(worker);
  }

  // Единый метод авторизации для администратора и рабочего
  async login(
    username: string,
    password: string,
  ): Promise<{ token: string; role: string }> {
    // Проверяем, является ли пользователь администратором
    const admin = await this.adminRepository.findOne({ where: { username } });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const token = this.jwtService.sign({ id: admin.id, role: 'admin' });
      return { token, role: 'admin' };
    }
    // Если администратор не найден, проверяем рабочего
    const worker = await this.workerRepository.findOne({ where: { username } });
    if (worker && (await bcrypt.compare(password, worker.password))) {
      const token = this.jwtService.sign({ id: worker.id, role: 'worker' });
      return { token, role: 'worker' };
    }
    throw new UnauthorizedException('Неверные учетные данные');
  }
}
