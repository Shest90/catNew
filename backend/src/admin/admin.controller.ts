// src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import { SettingsService } from '../settings/settings.service'; // ← импорт сервисa настроек
import { RegisterAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateSettingDto } from '../settings/dto/update-setting.dto'; // ← импорт DTO для обновления настроек
import { Request } from 'express';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly settingsService: SettingsService, // ← внедряем SettingsService
    private readonly adminService: AdminService,
  ) {}

  // --- Новый endpoint для работы с глобальными настройками ---
  @UseGuards(JwtAuthGuard)
  @Get('settings')
  async getSettings(@Req() req: Request) {
    // здесь мы явно объявляем adminId
    const adminId = (req.user as any).id as number;
    return this.settingsService.getForAdmin(adminId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('settings')
  async updateSettings(@Req() req: Request, @Body() dto: UpdateSettingDto) {
    const adminId = (req.user as any).id as number;
    return this.settingsService.updateForAdmin(adminId, dto);
  }
  // --- Конец блока настроек ---

  @Post()
  create(@Body() createAdminDto: RegisterAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('workers')
  async getWorkers(@Req() req: Request) {
    const adminId = req.user?.['id'];
    if (!adminId) {
      throw new Error('Не удалось определить администратора из запроса.');
    }
    return this.adminService.getWorkersByAdminId(adminId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }

  // Новый endpoint для удаления рабочего
  @UseGuards(JwtAuthGuard)
  @Delete('workers/:workerId')
  async deleteWorker(@Req() req: Request, @Param('workerId') workerId: string) {
    const adminId = req.user?.['id'];
    if (!adminId) {
      throw new Error('Не удалось определить администратора из запроса.');
    }
    return this.adminService.deleteWorker(adminId, +workerId);
  }
}
