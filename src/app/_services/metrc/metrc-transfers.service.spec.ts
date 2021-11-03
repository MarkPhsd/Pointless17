import { TestBed } from '@angular/core/testing';

import { MetrcTransfersService } from './metrc-transfers.service';

describe('MetrcTransfersService', () => {
  let service: MetrcTransfersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcTransfersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
