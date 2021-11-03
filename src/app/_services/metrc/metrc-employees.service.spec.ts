import { TestBed } from '@angular/core/testing';

import { MetrcEmployeesService } from './metrc-employees.service';

describe('MetrcEmployeesService', () => {
  let service: MetrcEmployeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcEmployeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
