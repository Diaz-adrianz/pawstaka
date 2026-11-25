import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StoreService } from '../../../../infra/store/store.service';
import { ResourceQueryDto } from '../../../../shared/dto/resource-query.dto';
import { Permission } from '../../../access-control/decorators/permission.decorator';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan.dto';

@Controller('library/loans')
export class LoanController {
  constructor(
    private readonly loanService: LoanService,
    private store: StoreService,
  ) {}

  @Permission('library:loan:create')
  @Post()
  borrow(@Body() dto: CreateLoanDto) {
    return this.loanService.borrow(dto, this.store.user.id);
  }

  @Permission('library:loan:read')
  @Get()
  findMany(@Query() query: ResourceQueryDto) {
    const rq = this.store.buildResourceQuery().addFromDto(query);
    return this.loanService.findMany(rq);
  }

  @Permission('library:loan:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.loanService.findOne(rq);
  }

  @Permission('library:loan:return')
  @Patch(':id/return')
  returnLoan(@Param('id') id: string) {
    return this.loanService.returnLoan(id);
  }
}
