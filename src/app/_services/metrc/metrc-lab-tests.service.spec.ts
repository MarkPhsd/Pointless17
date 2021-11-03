import { TestBed } from '@angular/core/testing';

import { MetrcLabTestsService } from './metrc-lab-tests.service';

describe('MetrcLabTestsService', () => {
  let service: MetrcLabTestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcLabTestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
