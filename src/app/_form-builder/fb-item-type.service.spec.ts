import { TestBed } from '@angular/core/testing';

import { FbItemTypeService } from './fb-item-type.service';

describe('FbItemTypeService', () => {
  let service: FbItemTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbItemTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
