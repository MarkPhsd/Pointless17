import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceCategoryTimeFiltersComponent } from './price-category-time-filters.component';

describe('PriceCategoryTimeFiltersComponent', () => {
  let component: PriceCategoryTimeFiltersComponent;
  let fixture: ComponentFixture<PriceCategoryTimeFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceCategoryTimeFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceCategoryTimeFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
