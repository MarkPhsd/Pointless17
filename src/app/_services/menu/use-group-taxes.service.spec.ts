import { TestBed } from '@angular/core/testing';

import { UseGroupTaxesService } from './use-group-taxes.service';

describe('UseGroupTaxesService', () => {
  let service: UseGroupTaxesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UseGroupTaxesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
