import { TestBed } from '@angular/core/testing';

import { FbNavMenuService } from './fb-nav-menu.service';

describe('FbNavMenuService', () => {
  let service: FbNavMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbNavMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
