import { TestBed } from '@angular/core/testing';

import { DcapMethodsService } from './dcap-methods.service';

describe('DcapMethodsService', () => {
  let service: DcapMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DcapMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
