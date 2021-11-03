import { TestBed } from '@angular/core/testing';

import { UISettingsService } from './uisettings.service';

describe('UISettingsService', () => {
  let service: UISettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UISettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
