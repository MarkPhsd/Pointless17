import { TestBed } from '@angular/core/testing';

import { FloorPlanService } from './floor-plan.service';

describe('FloorPlanService', () => {
  let service: FloorPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FloorPlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
