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
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookCoverDto } from './dto/update-book-cover.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('library/books')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private store: StoreService,
  ) {}

  @Permission('library:book:create')
  @Post()
  create(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }

  @Permission('library:book:read')
  @Get()
  findMany(@Query() query: ResourceQueryDto) {
    const rq = this.store.buildResourceQuery().addFromDto(query);
    return this.bookService.findMany(rq);
  }

  @Permission('library:book:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.bookService.findOne(rq);
  }

  @Permission('library:book:update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.bookService.update(rq, dto);
  }

  @Permission('library:book:update-cover')
  @Patch(':id/cover')
  updateCover(@Param('id') id: string, @Body() dto: UpdateBookCoverDto) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.bookService.updateCover(rq, dto);
  }

  @Permission('library:book:archive')
  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.bookService.archive(rq);
  }

  @Permission('library:book:restore')
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.bookService.restore(rq);
  }

  @Permission('library:book:delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.bookService.delete(rq);
  }
}
