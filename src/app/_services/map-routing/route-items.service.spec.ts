import { TestBed } from '@angular/core/testing';

import { ItemsRoutingService } from '../transactions/items-routing.service';

describe('ItemsRoutingService', () => {
  let service: ItemsRoutingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemsRoutingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});


