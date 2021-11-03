import { TestBed } from '@angular/core/testing';

import { ClientTableService } from './client-table.service';

describe('ClientTableService', () => {
  let service: ClientTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
