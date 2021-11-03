import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemCategoriesEditComponent } from './item-categories-edit.component';

describe('ItemCategoriesEditComponent', () => {
  let component: ItemCategoriesEditComponent;
  let fixture: ComponentFixture<ItemCategoriesEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemCategoriesEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemCategoriesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
