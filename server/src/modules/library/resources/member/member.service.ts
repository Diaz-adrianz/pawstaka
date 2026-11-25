import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceService } from '../../../../common/services/resource.service';
import { DatabaseKeys } from '../../../../database/database-keys.constant';
import { ResourceQuery } from '../../../../shared/classes/resource-query.class';
import { MemberHasLoansException } from '../../classes/exceptions/library.exception';
import { Loan } from '../../entities/loan.entity';
import { Member } from '../../entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MemberService extends ResourceService<Member> {
  constructor(
    @InjectRepository(Member, DatabaseKeys.DEFAULT)
    private memberRepo: Repository<Member>,
    @InjectRepository(Loan, DatabaseKeys.DEFAULT)
    private loanRepo: Repository<Loan>,
  ) {
    super(memberRepo);
  }

  async create(dto: CreateMemberDto) {
    const data = this.memberRepo.create(dto);
    return this.memberRepo.save(data);
  }

  async findMany(rq: ResourceQuery) {
    return this.memberRepo.findAndCount(rq.toFindOptions());
  }

  async findOne(rq: ResourceQuery) {
    return this.memberRepo.findOneOrFail(rq.toFindOptions());
  }

  async update(rq: ResourceQuery, dto: UpdateMemberDto) {
    const data = await this.load(rq.toFindOptions());
    this.memberRepo.merge(data, dto);
    return this.memberRepo.save(data);
  }

  async archive(rq: ResourceQuery) {
    const data = await this.load(rq.toFindOptions());
    return this.memberRepo.softRemove(data);
  }

  async restore(rq: ResourceQuery) {
    rq.setTrash(true);
    const data = await this.load(rq.toFindOptions());
    return this.memberRepo.recover(data);
  }

  async delete(rq: ResourceQuery) {
    rq.setTrash(true);
    const data = await this.load(rq.toFindOptions());

    const loans = await this.loanRepo.count({
      where: { memberId: data.id },
    });
    if (loans) throw new MemberHasLoansException();

    return this.memberRepo.remove(data);
  }
}
