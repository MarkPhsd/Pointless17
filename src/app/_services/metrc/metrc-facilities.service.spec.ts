import { TestBed } from '@angular/core/testing';

import { MetrcFacilitiesService } from './metrc-facilities.service';

describe('MetrcFacilitiesService', () => {
  let service: MetrcFacilitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcFacilitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
