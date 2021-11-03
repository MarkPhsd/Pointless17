import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodProductEditComponent } from './food-product-edit.component';

describe('FoodProductEditComponent', () => {
  let component: FoodProductEditComponent;
  let fixture: ComponentFixture<FoodProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoodProductEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
