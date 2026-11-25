import { Module } from '@nestjs/common';
import { DefaultDatabaseModule } from '../../database/default/default-database.module';
import { CategoryController } from './resources/category/category.controller';
import { CategoryService } from './resources/category/category.service';
import { BookController } from './resources/book/book.controller';
import { BookService } from './resources/book/book.service';
import { Book } from './entities/book.entity';
import { Category } from './entities/category.entity';
import { Loan } from './entities/loan.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    DefaultDatabaseModule.forFeature([Category, Book, Loan]),
    StorageModule,
  ],
  controllers: [CategoryController, BookController],
  providers: [CategoryService, BookService],
})
export class LibraryModule {}
