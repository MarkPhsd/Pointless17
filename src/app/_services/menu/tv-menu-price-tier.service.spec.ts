import { TestBed } from '@angular/core/testing';

import { TvMenuPriceTierService } from './tv-menu-price-tier.service';

describe('TvMenuPriceTierService', () => {
  let service: TvMenuPriceTierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TvMenuPriceTierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
