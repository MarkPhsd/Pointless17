import { TestBed } from '@angular/core/testing';

import { ManifestStatusService } from './manifest-status.service';

describe('ManifestStatusService', () => {
  let service: ManifestStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManifestStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
