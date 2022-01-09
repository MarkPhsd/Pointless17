import { TestBed } from '@angular/core/testing';

import { MenuServiceMethodsService } from './menu-service-methods.service';

describe('MenuServiceMethodsService', () => {
  let service: MenuServiceMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuServiceMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
