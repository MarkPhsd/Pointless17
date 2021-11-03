import { TestBed } from '@angular/core/testing';

import { BalanceSheetService } from './balance-sheet.service';

describe('BalanceSheetService', () => {
  let service: BalanceSheetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BalanceSheetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
