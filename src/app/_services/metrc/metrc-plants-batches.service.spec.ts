import { TestBed } from '@angular/core/testing';

import { MetrcPlantsBatchesService } from './metrc-plants-batches.service';

describe('MetrcPlantsBatchesService', () => {
  let service: MetrcPlantsBatchesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcPlantsBatchesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
