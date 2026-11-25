import { Module } from '@nestjs/common';
import { DefaultDatabaseModule } from '../../database/default/default-database.module';
import { CategoryController } from './resources/category/category.controller';
import { CategoryService } from './resources/category/category.service';
import { Book } from './entities/book.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [DefaultDatabaseModule.forFeature([Category, Book])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class LibraryModule {}
