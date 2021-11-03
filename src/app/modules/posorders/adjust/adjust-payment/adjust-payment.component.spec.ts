import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustPaymentComponent } from './adjust-payment.component';

describe('AdjustPaymentComponent', () => {
  let component: AdjustPaymentComponent;
  let fixture: ComponentFixture<AdjustPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
