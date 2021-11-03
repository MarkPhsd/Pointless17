import { TestBed } from '@angular/core/testing';

import { FbUnitTypeService } from './fb-unit-type.service';

describe('FbUnitTypeService', () => {
  let service: FbUnitTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbUnitTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
