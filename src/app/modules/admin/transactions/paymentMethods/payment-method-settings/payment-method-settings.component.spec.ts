import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodSettingsComponent } from './payment-method-settings.component';

describe('PaymentMethodSettingsComponent', () => {
  let component: PaymentMethodSettingsComponent;
  let fixture: ComponentFixture<PaymentMethodSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentMethodSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentMethodSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
