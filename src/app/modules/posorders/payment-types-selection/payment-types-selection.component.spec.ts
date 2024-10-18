import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTypesSelectionComponent } from './payment-types-selection.component';

describe('PaymentTypesSelectionComponent', () => {
  let component: PaymentTypesSelectionComponent;
  let fixture: ComponentFixture<PaymentTypesSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentTypesSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentTypesSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
