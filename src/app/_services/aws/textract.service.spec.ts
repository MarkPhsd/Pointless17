import { TestBed } from '@angular/core/testing';

import { TextractService } from './textract.service';

describe('TextractService', () => {
  let service: TextractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
