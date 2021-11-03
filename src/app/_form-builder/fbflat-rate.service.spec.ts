import { TestBed } from '@angular/core/testing';

import { FBFlatRateService } from './fbflat-rate.service';

describe('FBFlatRateService', () => {
  let service: FBFlatRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FBFlatRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
