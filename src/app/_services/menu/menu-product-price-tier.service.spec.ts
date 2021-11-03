import { TestBed } from '@angular/core/testing';

import { MenuProductPriceTierService } from './menu-product-price-tier.service';

describe('MenuProductPriceTierService', () => {
  let service: MenuProductPriceTierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuProductPriceTierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
