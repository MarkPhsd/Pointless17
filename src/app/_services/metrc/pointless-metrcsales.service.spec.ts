import { TestBed } from '@angular/core/testing';

import { PointlessMETRCSalesService } from './pointless-metrcsales.service';

describe('PointlessMETRCSalesService', () => {
  let service: PointlessMETRCSalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PointlessMETRCSalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
