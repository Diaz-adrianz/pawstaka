import { Controller, Get, Query } from '@nestjs/common';
import { Permission } from '../../../access-control/decorators/permission.decorator';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportService } from './report.service';

@Controller('library/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Permission('library:report:read')
  @Get('summary')
  summary(@Query() query: ReportQueryDto) {
    return this.reportService.summary(query);
  }
}
