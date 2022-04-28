import { TestBed } from '@angular/core/testing';

import { ManifestTypesService } from './manifest-types.service';

describe('ManifestTypesService', () => {
  let service: ManifestTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManifestTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
