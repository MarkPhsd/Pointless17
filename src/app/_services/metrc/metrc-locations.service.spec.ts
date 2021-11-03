import { TestBed } from '@angular/core/testing';

import { MetrcLocationsService } from './metrc-locations.service';

describe('MetrcLocationsService', () => {
  let service: MetrcLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
