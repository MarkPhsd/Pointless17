import { TestBed } from '@angular/core/testing';

import { AnalyticsServiceService } from './analytics-service.service';

describe('AnalyticsServiceService', () => {
  let service: AnalyticsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyticsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
