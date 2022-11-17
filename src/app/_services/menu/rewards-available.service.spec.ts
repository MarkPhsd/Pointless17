import { TestBed } from '@angular/core/testing';

import { RewardsAvailableService } from './rewards-available.service';

describe('RewardsAvailableService', () => {
  let service: RewardsAvailableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RewardsAvailableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
