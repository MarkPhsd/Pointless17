import { TestBed } from '@angular/core/testing';

import { ItemTypeDisplayAssignmentService } from './item-type-display-assignment.service';

describe('ItemTypeDisplayAssignmentService', () => {
  let service: ItemTypeDisplayAssignmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemTypeDisplayAssignmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
