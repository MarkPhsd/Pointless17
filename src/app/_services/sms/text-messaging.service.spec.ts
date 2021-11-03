import { TestBed } from '@angular/core/testing';

import { TextMessagingService } from './text-messaging.service';

describe('TextMessagingService', () => {
  let service: TextMessagingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextMessagingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
