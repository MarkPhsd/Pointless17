import { TestBed } from '@angular/core/testing';

import { EmployeeClockMethodsService } from './employee-clock-methods.service';

describe('EmployeeClockMethodsService', () => {
  let service: EmployeeClockMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeClockMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
