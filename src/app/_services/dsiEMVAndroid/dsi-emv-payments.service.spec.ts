import { TestBed } from '@angular/core/testing';

import { DsiEmvPaymentsService } from './dsi-emv-payments.service';

describe('DsiEmvPaymentsService', () => {
  let service: DsiEmvPaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DsiEmvPaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
