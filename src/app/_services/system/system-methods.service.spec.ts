import { TestBed } from '@angular/core/testing';

import { SystemMethodsService } from './system-methods.service';

describe('SystemMethodsService', () => {
  let service: SystemMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
