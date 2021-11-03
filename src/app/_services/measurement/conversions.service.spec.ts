import { TestBed } from '@angular/core/testing';

import { ConversionsService } from './conversions.service';

describe('ConversionsService', () => {
  let service: ConversionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
