import { TestBed } from '@angular/core/testing';

import { PrinterLocationsService } from './printer-locations.service';

describe('PrinterLocationsService', () => {
  let service: PrinterLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrinterLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
