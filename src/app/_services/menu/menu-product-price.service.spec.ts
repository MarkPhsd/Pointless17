import { TestBed } from '@angular/core/testing';

import { MenuProductPriceService } from './menu-product-price.service';

describe('MenuProductPriceService', () => {
  let service: MenuProductPriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuProductPriceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
