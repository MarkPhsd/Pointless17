import { TestBed } from '@angular/core/testing';

import { UnitTypeMethodsService } from './unit-type-methods.service';

describe('UnitTypeMethodsService', () => {
  let service: UnitTypeMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitTypeMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
