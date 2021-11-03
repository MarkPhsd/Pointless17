import { TestBed } from '@angular/core/testing';

import { PriceCategoriesService } from './price-categories.service';

describe('PriceCategoriesService', () => {
  let service: PriceCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
