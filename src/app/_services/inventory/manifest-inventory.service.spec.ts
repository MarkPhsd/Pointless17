import { TestBed } from '@angular/core/testing';

import { ManifestInventoryService } from './manifest-inventory.service';

describe('ManifestInventoryService', () => {
  let service: ManifestInventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManifestInventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
