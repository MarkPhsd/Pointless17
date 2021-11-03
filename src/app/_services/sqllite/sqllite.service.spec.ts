import { TestBed } from '@angular/core/testing';

import { SqlliteService } from './sqllite.service';

describe('SqlliteService', () => {
  let service: SqlliteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqlliteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
