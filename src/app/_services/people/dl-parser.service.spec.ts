import { TestBed } from '@angular/core/testing';

import { DlParserService } from './dl-parser.service';

describe('DlParserService', () => {
  let service: DlParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DlParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
