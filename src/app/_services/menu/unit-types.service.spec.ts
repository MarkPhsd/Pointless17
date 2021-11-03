import { TestBed } from '@angular/core/testing';

import { UnitTypesService } from './unit-types.service';

describe('UnitTypesService', () => {
  let service: UnitTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
