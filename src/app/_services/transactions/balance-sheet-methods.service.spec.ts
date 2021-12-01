import { TestBed } from '@angular/core/testing';

import { BalanceSheetMethodsService } from './balance-sheet-methods.service';

describe('BalanceSheetMethodsService', () => {
  let service: BalanceSheetMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BalanceSheetMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
