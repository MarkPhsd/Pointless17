import { TestBed } from '@angular/core/testing';

import { FlatRateService } from './flat-rate.service';

describe('FlatRateService', () => {
  let service: FlatRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlatRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
