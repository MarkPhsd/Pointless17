import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentReportCardComponent } from './payment-report-card.component';

describe('PaymentReportCardComponent', () => {
  let component: PaymentReportCardComponent;
  let fixture: ComponentFixture<PaymentReportCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentReportCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentReportCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
