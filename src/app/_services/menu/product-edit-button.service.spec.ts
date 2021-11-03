import { TestBed } from '@angular/core/testing';

import { ProductEditButtonService } from './product-edit-button.service';

describe('ProductEditButtonService', () => {
  let service: ProductEditButtonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductEditButtonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
