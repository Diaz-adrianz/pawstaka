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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('library/categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private store: StoreService,
  ) {}

  @Permission('library:category:create')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Permission('library:category:read')
  @Get()
  findMany(@Query() query: ResourceQueryDto) {
    const rq = this.store.buildResourceQuery().addFromDto(query);
    return this.categoryService.findMany(rq);
  }

  @Permission('library:category:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.categoryService.findOne(rq);
  }

  @Permission('library:category:update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.categoryService.update(rq, dto);
  }

  @Permission('library:category:archive')
  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.categoryService.archive(rq);
  }

  @Permission('library:category:restore')
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.categoryService.restore(rq);
  }

  @Permission('library:category:delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    const rq = this.store.buildResourceQuery().add([['id', 'eq', id]]);
    return this.categoryService.delete(rq);
  }
}
