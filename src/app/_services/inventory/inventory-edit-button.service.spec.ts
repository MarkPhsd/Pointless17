import { TestBed } from '@angular/core/testing';

import { InventoryEditButtonService } from './inventory-edit-button.service';

describe('InventoryEditButtonService', () => {
  let service: InventoryEditButtonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryEditButtonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
