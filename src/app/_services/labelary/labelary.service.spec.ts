import { TestBed } from '@angular/core/testing';

import { LabelaryService } from './labelary.service';

describe('LabelaryService', () => {
  let service: LabelaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabelaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
