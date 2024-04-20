import { TestBed } from '@angular/core/testing';

import { SwipeBackServiceService } from './swipe-back-service.service';

describe('SwipeBackServiceService', () => {
  let service: SwipeBackServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwipeBackServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
