import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EbayAuthRedirectComponent } from './ebay-auth-redirect.component';

describe('EbayAuthRedirectComponent', () => {
  let component: EbayAuthRedirectComponent;
  let fixture: ComponentFixture<EbayAuthRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EbayAuthRedirectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EbayAuthRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
