import { TestBed } from '@angular/core/testing';

import { AdjustmentReasonsService } from './adjustment-reasons.service';

describe('AdjustmentReasonsService', () => {
  let service: AdjustmentReasonsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdjustmentReasonsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
