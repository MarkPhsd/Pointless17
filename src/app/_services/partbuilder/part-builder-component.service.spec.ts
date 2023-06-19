import { TestBed } from '@angular/core/testing';

import { PartBuilderComponentService } from './part-builder-component.service';

describe('PartBuilderComponentService', () => {
  let service: PartBuilderComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartBuilderComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
