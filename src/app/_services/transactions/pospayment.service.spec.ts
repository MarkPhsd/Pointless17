import { TestBed } from '@angular/core/testing';

import { POSPaymentService } from './pospayment.service';

describe('POSPaymentService', () => {
  let service: POSPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(POSPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
