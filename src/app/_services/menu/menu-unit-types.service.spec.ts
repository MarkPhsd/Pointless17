import { TestBed } from '@angular/core/testing';

import { MenuUnitTypesService } from './menu-unit-types.service';

describe('MenuUnitTypesService', () => {
  let service: MenuUnitTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuUnitTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
