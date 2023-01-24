import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeCardPayBtnComponent } from './stripe-card-pay-btn.component';

describe('StripeCardPayBtnComponent', () => {
  let component: StripeCardPayBtnComponent;
  let fixture: ComponentFixture<StripeCardPayBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StripeCardPayBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StripeCardPayBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
