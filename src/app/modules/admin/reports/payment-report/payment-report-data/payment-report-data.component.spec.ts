import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentReportDataComponent } from './payment-report-data.component';

describe('PaymentReportDataComponent', () => {
  let component: PaymentReportDataComponent;
  let fixture: ComponentFixture<PaymentReportDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentReportDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentReportDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
