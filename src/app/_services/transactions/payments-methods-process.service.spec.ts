import { TestBed } from '@angular/core/testing';

import { PaymentsMethodsProcessService } from './payments-methods-process.service';

describe('PaymentsMethodsProcessService', () => {
  let service: PaymentsMethodsProcessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentsMethodsProcessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
