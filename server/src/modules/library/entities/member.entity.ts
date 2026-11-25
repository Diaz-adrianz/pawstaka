import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'library', name: 'members' })
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true, unique: true })
  userId: string | null;

  @Column('varchar', { unique: true })
  code: string;

  @Column('varchar')
  name: string;

  @Column('varchar', { nullable: true })
  email: string | null;

  @Column('varchar', { nullable: true })
  phone: string | null;

  @Column('text', { nullable: true })
  address: string | null;

  @Column('bool', { default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
