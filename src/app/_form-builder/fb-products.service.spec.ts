import { TestBed } from '@angular/core/testing';

import { FbProductsService } from './fb-products.service';

describe('FbProductsService', () => {
  let service: FbProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
