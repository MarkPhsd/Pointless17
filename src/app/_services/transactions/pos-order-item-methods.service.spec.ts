import { TestBed } from '@angular/core/testing';

import { PosOrderItemMethodsService } from './pos-order-item-methods.service';

describe('PosOrderItemMethodsService', () => {
  let service: PosOrderItemMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PosOrderItemMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
