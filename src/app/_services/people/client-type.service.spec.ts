import { TestBed } from '@angular/core/testing';

import { ClientTypeService } from './client-type.service';

describe('ClientTypeService', () => {
  let service: ClientTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
