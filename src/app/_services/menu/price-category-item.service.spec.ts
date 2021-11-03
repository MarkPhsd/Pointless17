import { TestBed } from '@angular/core/testing';

import { PriceCategoryItemService } from './price-category-item.service';

describe('PriceCategoryItemService', () => {
  let service: PriceCategoryItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceCategoryItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
