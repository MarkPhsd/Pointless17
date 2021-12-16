import { TestBed } from '@angular/core/testing';

import { ItemTypeMethodsService } from './item-type-methods.service';

describe('ItemTypeMethodsService', () => {
  let service: ItemTypeMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemTypeMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
