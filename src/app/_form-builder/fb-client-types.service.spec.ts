import { TestBed } from '@angular/core/testing';

import { FbClientTypesService } from './fb-client-types.service';

describe('FbClientTypesService', () => {
  let service: FbClientTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbClientTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
