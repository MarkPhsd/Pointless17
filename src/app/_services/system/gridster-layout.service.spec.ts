import { TestBed } from '@angular/core/testing';

import { GridsterLayoutService } from './gridster-layout.service';

describe('GridsterLayoutService', () => {
  let service: GridsterLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridsterLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
