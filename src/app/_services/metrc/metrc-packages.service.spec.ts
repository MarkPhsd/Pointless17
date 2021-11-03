import { TestBed } from '@angular/core/testing';

import { MetrcPackagesService } from './metrc-packages.service';

describe('MetrcPackagesService', () => {
  let service: MetrcPackagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcPackagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
