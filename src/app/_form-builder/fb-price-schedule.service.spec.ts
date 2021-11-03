import { TestBed } from '@angular/core/testing';

import { FbPriceScheduleService } from './fb-price-schedule.service';

describe('FbPriceScheduleService', () => {
  let service: FbPriceScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbPriceScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
