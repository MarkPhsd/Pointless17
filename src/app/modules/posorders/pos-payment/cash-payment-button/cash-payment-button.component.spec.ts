import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashPaymentButtonComponent } from './cash-payment-button.component';

describe('CashPaymentButtonComponent', () => {
  let component: CashPaymentButtonComponent;
  let fixture: ComponentFixture<CashPaymentButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashPaymentButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashPaymentButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
