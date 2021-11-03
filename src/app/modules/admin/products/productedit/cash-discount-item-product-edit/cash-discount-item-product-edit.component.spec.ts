import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashDiscountItemProductEditComponent } from './cash-discount-item-product-edit.component';

describe('CashDiscountItemProductEditComponent', () => {
  let component: CashDiscountItemProductEditComponent;
  let fixture: ComponentFixture<CashDiscountItemProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashDiscountItemProductEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashDiscountItemProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
