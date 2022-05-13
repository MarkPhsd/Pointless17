import { TestBed } from '@angular/core/testing';

import { FakeContactsService } from './fake-contacts.service';

describe('FakeContactsService', () => {
  let service: FakeContactsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FakeContactsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
