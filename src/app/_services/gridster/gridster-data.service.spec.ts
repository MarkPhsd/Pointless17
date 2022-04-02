import { TestBed } from '@angular/core/testing';

import { GridsterDataService } from './gridster-data.service';

describe('GridsterDataService', () => {
  let service: GridsterDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridsterDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
