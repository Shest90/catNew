// src/admin/admin.controller.ts
import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from '../settings/settings.service';
import { UpdateSettingDto } from '../settings/dto/update-setting.dto';
import { Request } from 'express';

@Controller('admin/settings') // ← ИЗМЕНЕНО: вынесли в отдельный контроллер
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /** GET /admin/settings */
  @Get()
  async getForAdmin(@Req() req: Request) {
    const adminId = (req.user as any).id as number;
    return this.settingsService.getForAdmin(adminId); // ← ИЗМЕНЕНО
  }

  /** PATCH /admin/settings */
  @Patch()
  async updateForAdmin(@Req() req: Request, @Body() dto: UpdateSettingDto) {
    const adminId = (req.user as any).id as number;
    return this.settingsService.updateForAdmin(adminId, dto); // ← ИЗМЕНЕНО
  }
}
