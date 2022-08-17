import { TestBed } from '@angular/core/testing';

import { SystemInitializationService } from './app-wizard.service';

describe('SystemInitializationService', () => {
  let service: SystemInitializationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemInitializationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
