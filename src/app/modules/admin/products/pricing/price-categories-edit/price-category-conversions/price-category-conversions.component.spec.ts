import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceCategoryConversionsComponent } from './price-category-conversions.component';

describe('PriceCategoryConversionsComponent', () => {
  let component: PriceCategoryConversionsComponent;
  let fixture: ComponentFixture<PriceCategoryConversionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceCategoryConversionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceCategoryConversionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
