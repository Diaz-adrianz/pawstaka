import {
  AfterLoad,
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { joinUrl } from '../../../shared/utils/string.util';
import { s3ConfigGlobal } from '../../../config/s3.config';

@Entity({ schema: 'library', name: 'books' })
@Check('"stock_available" >= 0')
@Check('"stock_available" <= "stock_total"')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  categoryId: string;

  @Column('varchar')
  title: string;

  @Column('varchar', { nullable: true })
  subtitle: string | null;

  @Column('varchar')
  author: string;

  @Column('varchar', { nullable: true })
  isbn: string | null;

  @Column('varchar', { nullable: true })
  publisher: string | null;

  @Column('int', { nullable: true })
  publishedYear: number | null;

  @Column('varchar', { nullable: true })
  publishedPlace: string | null;

  @Column('varchar', { nullable: true })
  edition: string | null;

  @Column('varchar', { nullable: true })
  language: string | null;

  @Column('int', { nullable: true })
  pages: number | null;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('varchar', { nullable: true })
  cover: string | null;

  @Column('varchar', { nullable: true })
  shelfLocation: string | null;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  category: Category;

  @Column('int')
  stockTotal: number;

  @Column('int')
  stockAvailable: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  // --------------------------
  coverUrl?: string | null;

  @AfterLoad()
  setCoverUrl() {
    if (this.cover)
      this.coverUrl = joinUrl(s3ConfigGlobal().default.publicUrl, this.cover);
  }
}
