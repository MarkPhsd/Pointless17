import { TestBed } from '@angular/core/testing';

import { IpinfoInterceptor } from './ipinfo.interceptor';

describe('IpinfoInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      IpinfoInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: IpinfoInterceptor = TestBed.inject(IpinfoInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
