import { TestBed } from '@angular/core/testing';

import { ReportDateHelpersService } from './report-date-helpers.service';

describe('ReportDateHelpersService', () => {
  let service: ReportDateHelpersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportDateHelpersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
