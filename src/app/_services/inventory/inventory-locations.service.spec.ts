import { TestBed } from '@angular/core/testing';

import { InventoryLocationsService } from './inventory-locations.service';

describe('InventoryLocationsService', () => {
  let service: InventoryLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
