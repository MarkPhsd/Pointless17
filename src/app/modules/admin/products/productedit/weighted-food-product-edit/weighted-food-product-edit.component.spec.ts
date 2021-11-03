import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightedFoodProductEditComponent } from './weighted-food-product-edit.component';

describe('WeightedFoodProductEditComponent', () => {
  let component: WeightedFoodProductEditComponent;
  let fixture: ComponentFixture<WeightedFoodProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeightedFoodProductEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeightedFoodProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
