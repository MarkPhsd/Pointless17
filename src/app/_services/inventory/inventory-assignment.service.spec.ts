import { TestBed } from '@angular/core/testing';

import { InventoryAssignmentService } from './inventory-assignment.service';

describe('InventoryAssignmentService', () => {
  let service: InventoryAssignmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryAssignmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
