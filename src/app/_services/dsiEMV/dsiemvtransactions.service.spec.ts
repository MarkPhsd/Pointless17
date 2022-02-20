import { TestBed } from '@angular/core/testing';

import { DSIEMVTransactionsService } from './dsiemvtransactions.service';

describe('DSIEMVTransactionsService', () => {
  let service: DSIEMVTransactionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DSIEMVTransactionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
