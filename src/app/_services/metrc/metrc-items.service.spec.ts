import { TestBed } from '@angular/core/testing';

import { MetrcItemsService } from './metrc-items.service';

describe('MetrcItemsService', () => {
  let service: MetrcItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
