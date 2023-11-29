import { TestBed } from '@angular/core/testing';

import { BrandsResaleService } from './brands-resale.service';

describe('BrandsResaleService', () => {
  let service: BrandsResaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrandsResaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
