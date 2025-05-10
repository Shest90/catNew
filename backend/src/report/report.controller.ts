// backend/src/report/report.controller.ts
import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/worker/:workerId/report')
export class ReportController {
  constructor(private readonly svc: ReportService) {}

  @Get()
  getWorkerReport(
    @Param('workerId') workerId: string,
    @Query() filter: ReportFilterDto,
  ) {
    return this.svc.getWorkerReport(+workerId, filter);
  }
}
