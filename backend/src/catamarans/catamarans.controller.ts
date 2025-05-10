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
import { CatamaransService } from './catamarans.service';
import { CreateCatamaranDto } from './dto/create-catamaran.dto';
import { UpdateCatamaranDto } from './dto/update-catamaran.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('admin/worker/:workerId/catamarans')
@UseGuards(JwtAuthGuard)
export class CatamaransController {
  constructor(private readonly catamaransService: CatamaransService) {}

  @Post()
  async createCatamaran(
    @Param('workerId') workerId: string,
    @Body() dto: CreateCatamaranDto,
    @Req() req: Request,
  ) {
    // При желании можно добавить проверку, что рабочий принадлежит администратору (на основе req.user)
    return await this.catamaransService.createCatamaran(+workerId, dto);
  }

  @Get()
  async getCatamarans(@Param('workerId') workerId: string) {
    return await this.catamaransService.getCatamaransByWorkerId(+workerId);
  }
  @Patch(':catamaranId')
  async update(
    @Param('workerId') workerId: string,
    @Param('catamaranId') catamaranId: string,
    @Body() dto: UpdateCatamaranDto,
  ) {
    return this.catamaransService.updateCatamaran(+workerId, +catamaranId, dto);
  }
  @Delete(':catamaranId')
  async deleteCatamaran(
    @Param('workerId') workerId: string,
    @Param('catamaranId') catamaranId: string,
  ) {
    return this.catamaransService.removeCatamaran(+workerId, +catamaranId);
  }
}
