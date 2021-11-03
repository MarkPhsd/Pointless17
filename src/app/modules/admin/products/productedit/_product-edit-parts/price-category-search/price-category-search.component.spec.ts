import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceCategorySearchComponent } from './price-category-search.component';

describe('PriceCategorySearchComponent', () => {
  let component: PriceCategorySearchComponent;
  let fixture: ComponentFixture<PriceCategorySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceCategorySearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceCategorySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
