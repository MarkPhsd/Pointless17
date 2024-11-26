import { TestBed } from '@angular/core/testing';

import { AuthLogOutService } from './auth-log-out.service';

describe('AuthLogOutService', () => {
  let service: AuthLogOutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthLogOutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
