import { TestBed } from '@angular/core/testing';

import { PriceScheduleService } from './price-schedule.service';

describe('PriceScheduleService', () => {
  let service: PriceScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
