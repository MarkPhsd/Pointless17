import { TestBed } from '@angular/core/testing';

import { UserTypeAuthService } from './user-type-auth.service';

describe('UserTypeAuthService', () => {
  let service: UserTypeAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserTypeAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
