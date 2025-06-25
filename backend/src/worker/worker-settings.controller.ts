// src/worker/worker-settings.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from '../settings/settings.service';
import { Request } from 'express';
import { JwtPayloadUser } from '../auth/interfaces/jwt-payload-user.interface';

@Controller('worker/settings')
@UseGuards(JwtAuthGuard)
export class WorkerSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettingsForWorker(@Req() req: Request) {
    console.log('req.user:', req.user);
    const worker = req.user as JwtPayloadUser;

    if (!worker.adminId || isNaN(Number(worker.adminId))) {
      throw new UnauthorizedException('adminId missing or invalid in token');
    }

    const adminId = Number(worker.adminId);
    return this.settingsService.getForWorker(adminId);
  }
}
