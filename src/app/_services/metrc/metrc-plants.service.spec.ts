import { TestBed } from '@angular/core/testing';

import { MetrcPlantsService } from './metrc-plants.service';

describe('MetrcPlantsService', () => {
  let service: MetrcPlantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcPlantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
