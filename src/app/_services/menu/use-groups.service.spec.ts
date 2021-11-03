import { TestBed } from '@angular/core/testing';

import { UseGroupsService } from './use-groups.service';

describe('UseGroupsService', () => {
  let service: UseGroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UseGroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
