import { TestBed } from '@angular/core/testing';

import { DcapPayAPIService } from './dcap-pay-api.service';

describe('DcapPayAPIService', () => {
  let service: DcapPayAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DcapPayAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
