import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceCategoryMultiplePricesComponent } from './price-category-multiple-prices.component';

describe('PriceCategoryMultiplePricesComponent', () => {
  let component: PriceCategoryMultiplePricesComponent;
  let fixture: ComponentFixture<PriceCategoryMultiplePricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceCategoryMultiplePricesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceCategoryMultiplePricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
