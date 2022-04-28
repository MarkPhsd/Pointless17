import { TestBed } from '@angular/core/testing';

import { ManifestMethodsService } from './manifest-methods.service';

describe('ManifestMethodsService', () => {
  let service: ManifestMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManifestMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
