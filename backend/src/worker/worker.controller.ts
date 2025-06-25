// src/worker/worker.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { JwtPayloadUser } from '../auth/interfaces/jwt-payload-user.interface';

@Controller('worker')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post()
  create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workerService.create(createWorkerDto);
  }

  @Get()
  findAll() {
    return this.workerService.findAll();
  }

  // Новый endpoint для получения списка катамаранов для рабочего
  @UseGuards(JwtAuthGuard)
  @Get('catamarans')
  async getCatamarans(@Req() req: Request) {
    console.log('req.user:', req.user);
    const user = req.user as JwtPayloadUser;
    if (!user.workerId || isNaN(Number(user.workerId))) {
      throw new UnauthorizedException('workerId missing or invalid in token');
    }
    const workerId = Number(user.workerId);
    return this.workerService.getCatamaransByWorkerId(workerId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkerDto: UpdateWorkerDto) {
    return this.workerService.update(+id, updateWorkerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workerService.remove(+id);
  }

  @Get('by-id/:id')
  findOne(@Param('id') id: string) {
    console.log('[worker.controller] param id:', id);
    const numericId = Number(id);
    console.log('[worker.controller] parsed id:', numericId);
    return this.workerService.findOne(numericId);
  }
}
