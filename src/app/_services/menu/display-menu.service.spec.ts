import { TestBed } from '@angular/core/testing';

import { DisplayMenuService } from './display-menu.service';

describe('DisplayMenuService', () => {
  let service: DisplayMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DisplayMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
