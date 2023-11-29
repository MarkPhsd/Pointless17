import { TestBed } from '@angular/core/testing';

import { ClassesResaleService } from './classes-resale.service';

describe('ClassesResaleService', () => {
  let service: ClassesResaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassesResaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
