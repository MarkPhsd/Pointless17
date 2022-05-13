import { TestBed } from '@angular/core/testing';

import { FakeInventoryService } from './fake-inventory.service';

describe('FakeInventoryService', () => {
  let service: FakeInventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FakeInventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
