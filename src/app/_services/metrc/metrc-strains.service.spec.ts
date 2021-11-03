import { TestBed } from '@angular/core/testing';

import { MetrcStrainsService } from './metrc-strains.service';

describe('MetrcStrainsService', () => {
  let service: MetrcStrainsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcStrainsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
