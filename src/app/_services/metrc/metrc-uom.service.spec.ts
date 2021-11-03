import { TestBed } from '@angular/core/testing';

import { MetrcUOMService } from './metrc-uom.service';

describe('MetrcUOMService', () => {
  let service: MetrcUOMService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcUOMService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
