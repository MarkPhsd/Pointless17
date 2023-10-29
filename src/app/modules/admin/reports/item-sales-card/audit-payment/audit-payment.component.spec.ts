import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditPaymentComponent } from './audit-payment.component';

describe('AuditPaymentComponent', () => {
  let component: AuditPaymentComponent;
  let fixture: ComponentFixture<AuditPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuditPaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
