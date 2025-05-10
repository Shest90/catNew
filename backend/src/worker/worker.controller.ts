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
} from '@nestjs/common';
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('worker')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post()
  create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workerService.create(createWorkerDto);
  }

  // Новый endpoint для получения списка катамаранов для рабочего
  @UseGuards(JwtAuthGuard)
  @Get('catamarans')
  async getCatamarans(@Req() req: Request) {
    const user = req.user as { id?: number | string };
    if (!user.id) {
      throw new Error('Worker id missing in JWT payload');
    }
    const workerId = Number(user.id);
    if (isNaN(workerId)) {
      throw new Error(`Worker id is not a valid number: ${user.id}`);
    }
    return await this.workerService.getCatamaransByWorkerId(workerId);
  }

  @Get()
  findAll() {
    return this.workerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkerDto: UpdateWorkerDto) {
    return this.workerService.update(+id, updateWorkerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workerService.remove(+id);
  }
}
