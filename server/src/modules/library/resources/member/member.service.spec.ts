import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ResourceQuery } from '../../../../shared/classes/resource-query.class';
import { MemberHasLoansException } from '../../classes/exceptions/library.exception';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberService } from './member.service';

describe('MemberService', () => {
  it('rejects hard delete when loan history exists', async () => {
    const memberRepo = {
      findOneOrFail: jest.fn().mockResolvedValue({ id: 'm1' }),
      remove: jest.fn(),
    } as any;
    const loanRepo = { count: jest.fn().mockResolvedValue(1) } as any;

    const service = new MemberService(memberRepo, loanRepo);

    await expect(
      service.delete(new ResourceQuery([['id', 'eq', 'm1']])),
    ).rejects.toBeInstanceOf(MemberHasLoansException);
    expect(memberRepo.remove).not.toHaveBeenCalled();
  });

  it('rejects null for non-null update fields', async () => {
    for (const field of ['code', 'name', 'active']) {
      const errors = await validate(
        plainToInstance(UpdateMemberDto, { [field]: null }),
      );
      expect(errors.map((error) => error.property)).toContain(field);
    }

    const errors = await validate(
      plainToInstance(UpdateMemberDto, { active: false }),
    );
    expect(errors).toHaveLength(0);
  });
});
