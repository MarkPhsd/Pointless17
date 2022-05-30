import { TestBed } from '@angular/core/testing';

import { StoreCreditService } from './store-credit.service';

describe('StoreCreditService', () => {
  let service: StoreCreditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreCreditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
