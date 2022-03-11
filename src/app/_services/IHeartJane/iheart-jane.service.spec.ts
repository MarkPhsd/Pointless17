import { TestBed } from '@angular/core/testing';

import { IHeartJaneService } from './iheart-jane.service';

describe('IHeartJaneService', () => {
  let service: IHeartJaneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IHeartJaneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
