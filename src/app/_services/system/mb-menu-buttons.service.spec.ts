import { TestBed } from '@angular/core/testing';

import { MBMenuButtonsService } from './mb-menu-buttons.service';

describe('MBMenuButtonsService', () => {
  let service: MBMenuButtonsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MBMenuButtonsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
