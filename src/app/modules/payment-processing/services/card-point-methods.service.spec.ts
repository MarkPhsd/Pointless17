import { TestBed } from '@angular/core/testing';

import { CardPointMethodsService } from './card-point-methods.service';

describe('CardPointMethodsService', () => {
  let service: CardPointMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardPointMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
