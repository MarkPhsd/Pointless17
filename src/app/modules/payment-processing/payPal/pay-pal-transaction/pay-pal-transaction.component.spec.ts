import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayPalTransactionComponent } from './pay-pal-transaction.component';

describe('PayPalTransactionComponent', () => {
  let component: PayPalTransactionComponent;
  let fixture: ComponentFixture<PayPalTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayPalTransactionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayPalTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
