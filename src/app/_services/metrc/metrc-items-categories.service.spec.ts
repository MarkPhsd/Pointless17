import { TestBed } from '@angular/core/testing';

import { MetrcItemsCategoriesService } from './metrc-items-categories.service';

describe('MetrcItemsCategoriesService', () => {
  let service: MetrcItemsCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrcItemsCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
