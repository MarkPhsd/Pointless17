import { TestBed } from '@angular/core/testing';

import { StatusTypeService } from './status-type.service';

describe('StatusTypeService', () => {
  let service: StatusTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
