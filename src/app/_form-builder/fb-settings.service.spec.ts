import { TestBed } from '@angular/core/testing';

import { FbSettingsService } from './fb-settings.service';

describe('FbSettingsService', () => {
  let service: FbSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
