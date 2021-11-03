import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPercentageDiscountProductEditComponent } from './order-percentage-discount-product-edit.component';

describe('OrderPercentageDiscountProductEditComponent', () => {
  let component: OrderPercentageDiscountProductEditComponent;
  let fixture: ComponentFixture<OrderPercentageDiscountProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderPercentageDiscountProductEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderPercentageDiscountProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
