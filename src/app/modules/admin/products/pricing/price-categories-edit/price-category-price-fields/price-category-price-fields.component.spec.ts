import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceCategoryPriceFieldsComponent } from './price-category-price-fields.component';

describe('PriceCategoryPriceFieldsComponent', () => {
  let component: PriceCategoryPriceFieldsComponent;
  let fixture: ComponentFixture<PriceCategoryPriceFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceCategoryPriceFieldsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceCategoryPriceFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
