import { TestBed } from '@angular/core/testing';

import { SiteLoginsService } from './site-logins.service';

describe('SiteLoginsService', () => {
  let service: SiteLoginsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SiteLoginsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
