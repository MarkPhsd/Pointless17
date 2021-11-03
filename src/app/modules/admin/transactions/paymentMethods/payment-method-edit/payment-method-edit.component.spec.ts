import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodEditComponent } from './payment-method-edit.component';

describe('PaymentMethodEditComponent', () => {
  let component: PaymentMethodEditComponent;
  let fixture: ComponentFixture<PaymentMethodEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentMethodEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentMethodEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
