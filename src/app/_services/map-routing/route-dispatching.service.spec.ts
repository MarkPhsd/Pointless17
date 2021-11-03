import { TestBed } from '@angular/core/testing';

import { RouteDispatchingService } from './route-dispatching.service';

describe('RouteDispatchingService', () => {
  let service: RouteDispatchingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteDispatchingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
