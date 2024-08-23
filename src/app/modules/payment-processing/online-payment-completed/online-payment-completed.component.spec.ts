import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlinePaymentCompletedComponent } from './online-payment-completed.component';

describe('OnlinePaymentCompletedComponent', () => {
  let component: OnlinePaymentCompletedComponent;
  let fixture: ComponentFixture<OnlinePaymentCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnlinePaymentCompletedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlinePaymentCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
