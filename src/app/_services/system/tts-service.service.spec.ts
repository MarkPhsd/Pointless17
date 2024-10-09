import { TestBed } from '@angular/core/testing';

import { TtsServiceService } from './tts-service.service';

describe('TtsServiceService', () => {
  let service: TtsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TtsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
