import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LoanStatus } from '../enums/loan-status.enum';
import { Book } from './book.entity';
import { Member } from './member.entity';

@Entity({ schema: 'library', name: 'loans' })
@Check(
  "(status = 'active' AND returned_at IS NULL) OR (status = 'returned' AND returned_at IS NOT NULL)",
)
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  memberId: string;

  @Index()
  @Column('uuid')
  bookId: string;

  @Column('timestamptz')
  borrowedAt: Date;

  @Column('timestamptz')
  dueAt: Date;

  @Column('timestamptz', { nullable: true })
  returnedAt: Date | null;

  @Index()
  @Column('enum', { enum: LoanStatus, enumName: 'loan_status_enum' })
  status: LoanStatus;

  @Column('varchar', { nullable: true })
  handledBy: string | null;

  @ManyToOne(() => Member, { onDelete: 'RESTRICT' })
  member: Member;

  @ManyToOne(() => Book, { onDelete: 'RESTRICT' })
  book: Book;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
