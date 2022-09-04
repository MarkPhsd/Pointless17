import { TestBed } from '@angular/core/testing';

import { CardPointBoltService } from './card-point-bolt.service';

describe('CardPointBoltService', () => {
  let service: CardPointBoltService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardPointBoltService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
