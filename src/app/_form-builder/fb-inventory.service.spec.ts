import { TestBed } from '@angular/core/testing';

import { FbInventoryService } from './fb-inventory.service';

describe('FbInventoryService', () => {
  let service: FbInventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbInventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
