import { TestBed } from '@angular/core/testing';

import { FBTaxesService } from './fbtaxes.service';

describe('FBTaxesService', () => {
  let service: FBTaxesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FBTaxesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
