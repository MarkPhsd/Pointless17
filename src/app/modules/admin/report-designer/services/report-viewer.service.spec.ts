import { TestBed } from '@angular/core/testing';

import { ReportViewerService } from './report-viewer.service';

describe('ReportViewerService', () => {
  let service: ReportViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
