import 'reflect-metadata';
import { ReportRangeException } from '../../classes/exceptions/library.exception';
import { ReportService } from './report.service';

describe('ReportService', () => {
  it('rejects a reversed date range', async () => {
    const service = new ReportService({} as any, {} as any, {} as any);

    await expect(
      service.summary({ from: '2026-02-01', to: '2026-01-01' }),
    ).rejects.toBeInstanceOf(ReportRangeException);
  });
});
