import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaypalCardPayBtnComponent } from './paypal-card-pay-btn.component';

describe('PaypalCardPayBtnComponent', () => {
  let component: PaypalCardPayBtnComponent;
  let fixture: ComponentFixture<PaypalCardPayBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaypalCardPayBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaypalCardPayBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
