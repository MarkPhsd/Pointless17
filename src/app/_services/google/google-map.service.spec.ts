import { TestBed } from '@angular/core/testing';

import { GoogleMAPService } from './google-map.service';

describe('GoogleMAPService', () => {
  let service: GoogleMAPService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleMAPService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
