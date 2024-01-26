import { TestBed } from '@angular/core/testing';

import { DcapService } from './dcap.service';

describe('DcapService', () => {
  let service: DcapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DcapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
