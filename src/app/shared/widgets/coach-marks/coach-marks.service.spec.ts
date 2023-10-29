import { TestBed } from '@angular/core/testing';

import { CoachMarksService } from './coach-marks.service';

describe('CoachMarksService', () => {
  let service: CoachMarksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoachMarksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
