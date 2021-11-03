import { TestBed } from '@angular/core/testing';

import { MetrcSalesService } from './metrc-sales.service';

describe('MetrcSalesService', () => {
  let service: MetrcSalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcSalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
