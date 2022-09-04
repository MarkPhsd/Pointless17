import { TestBed } from '@angular/core/testing';

import { DSIEMVAndroidService } from './dsiemvandroid.service';

describe('DSIEMVAndroidService', () => {
  let service: DSIEMVAndroidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DSIEMVAndroidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
