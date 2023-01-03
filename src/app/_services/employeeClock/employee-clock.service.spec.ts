import { TestBed } from '@angular/core/testing';

import { EmployeeClockService } from './employee-clock.service';

describe('EmployeeClockService', () => {
  let service: EmployeeClockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeClockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
