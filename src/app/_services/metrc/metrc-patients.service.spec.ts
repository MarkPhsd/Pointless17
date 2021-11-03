import { TestBed } from '@angular/core/testing';

import { MetrcPatientsService } from './metrc-patients.service';

describe('MetrcPatientsService', () => {
  let service: MetrcPatientsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcPatientsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
