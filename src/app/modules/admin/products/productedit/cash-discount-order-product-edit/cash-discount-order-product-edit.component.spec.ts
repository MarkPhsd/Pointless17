import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashDiscountOrderProductEditComponent } from './cash-discount-order-product-edit.component';

describe('CashDiscountOrderProductEditComponent', () => {
  let component: CashDiscountOrderProductEditComponent;
  let fixture: ComponentFixture<CashDiscountOrderProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashDiscountOrderProductEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashDiscountOrderProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
