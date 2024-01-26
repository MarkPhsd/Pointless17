import { TestBed } from '@angular/core/testing';

import { PrintQueService } from './print-que.service';

describe('PrintQueService', () => {
  let service: PrintQueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintQueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
