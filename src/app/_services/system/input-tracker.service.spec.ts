import { TestBed } from '@angular/core/testing';

import { InputTrackerService } from './input-tracker.service';

describe('InputTrackerService', () => {
  let service: InputTrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
