import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StoreService } from '../../../../infra/store/store.service';
import { ResourceQueryDto } from '../../../../shared/dto/resource-query.dto';
import { Permission } from '../../../access-control/decorators/permission.decorator';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Controller('library/members')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private store: StoreService,
  ) {}

  @Permission('library:member:create')
  @Post()
  create(@Body() dto: CreateMemberDto) {
    return this.memberService.create(dto);
  }

  @Permission('library:member:read')
  @Get()
  findMany(@Query() query: ResourceQueryDto) {
    const rq = this.store.buildResourceQuery().addFromDto(query);
    return this.memberService.findMany(rq);
  }

  @Permission('library:member:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.memberService.findOne(rq);
  }

  @Permission('library:member:update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.memberService.update(rq, dto);
  }

  @Permission('library:member:archive')
  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.memberService.archive(rq);
  }

  @Permission('library:member:restore')
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.memberService.restore(rq);
  }

  @Permission('library:member:delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.memberService.delete(rq);
  }
}
