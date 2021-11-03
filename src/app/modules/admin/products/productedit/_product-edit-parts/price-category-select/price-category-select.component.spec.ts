import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceCategorySelectComponent } from './price-category-select.component';

describe('PriceCategorySelectComponent', () => {
  let component: PriceCategorySelectComponent;
  let fixture: ComponentFixture<PriceCategorySelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceCategorySelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceCategorySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
