import { TestBed } from '@angular/core/testing';

import { MatricesService } from './matrices.service';

describe('MatricesService', () => {
  let service: MatricesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatricesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
