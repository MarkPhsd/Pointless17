import { TestBed } from '@angular/core/testing';

import { RequestMessageMethodsService } from './request-message-methods.service';

describe('RequestMessageMethodsService', () => {
  let service: RequestMessageMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestMessageMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
