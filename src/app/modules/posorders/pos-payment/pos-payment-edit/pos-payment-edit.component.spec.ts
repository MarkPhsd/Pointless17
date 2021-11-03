import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosPaymentEditComponent } from './pos-payment-edit.component';

describe('PosPaymentEditComponent', () => {
  let component: PosPaymentEditComponent;
  let fixture: ComponentFixture<PosPaymentEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosPaymentEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosPaymentEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
