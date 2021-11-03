import { TestBed } from '@angular/core/testing';

import { MetrcHarvestsService } from './metrc-harvests.service';

describe('MetrcHarvestsService', () => {
  let service: MetrcHarvestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcHarvestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
