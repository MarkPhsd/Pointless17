import { TestBed } from '@angular/core/testing';

import { FbServiceTypeService } from './fb-service-type.service';

describe('FbServiceTypeService', () => {
  let service: FbServiceTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbServiceTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
