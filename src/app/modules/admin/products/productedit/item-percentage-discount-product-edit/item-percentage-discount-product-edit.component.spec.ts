import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPercentageDiscountProductEditComponent } from './item-percentage-discount-product-edit.component';

describe('ItemPercentageDiscountProductEditComponent', () => {
  let component: ItemPercentageDiscountProductEditComponent;
  let fixture: ComponentFixture<ItemPercentageDiscountProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemPercentageDiscountProductEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemPercentageDiscountProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
