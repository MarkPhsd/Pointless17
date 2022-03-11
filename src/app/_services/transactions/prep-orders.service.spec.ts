import { TestBed } from '@angular/core/testing';

import { PrepOrdersService } from './prep-orders.service';

describe('PrepOrdersService', () => {
  let service: PrepOrdersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrepOrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
