import { TestBed } from '@angular/core/testing';

import { PriceScheduleDataService } from './price-schedule-data.service';

describe('PriceScheduleDataService', () => {
  let service: PriceScheduleDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceScheduleDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
