// src/settings/settings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from './setting.entity';
import { Repository } from 'typeorm';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Admin } from '../admin/entities/admin.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly repo: Repository<Setting>,
  ) {}

  /** Получить или создать настройки для конкретного админа */
  async getForAdmin(adminId: number): Promise<Setting> {
    const adminExists = await this.repo.manager
      .getRepository(Admin)
      .findOne({ where: { id: adminId } });

    if (!adminExists) {
      throw new NotFoundException(`Admin with ID ${adminId} does not exist`);
    }
    let s = await this.repo.findOne({
      where: { admin: { id: adminId } },
    });
    if (!s) {
      s = this.repo.create({ admin: { id: adminId } as any });
      await this.repo.save(s);
    }
    return s;
  }

  /** Обновить настройки данного админа */
  async updateForAdmin(
    adminId: number,
    dto: UpdateSettingDto,
  ): Promise<Setting> {
    const s = await this.getForAdmin(adminId);
    s.weekdayLimit = dto.weekdayLimit;
    s.weekendLimit = dto.weekendLimit;
    return this.repo.save(s);
  }
}
