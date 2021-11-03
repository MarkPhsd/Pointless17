import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemCategoriesListComponent } from './item-categories-list.component';

describe('ItemCategoriesListComponent', () => {
  let component: ItemCategoriesListComponent;
  let fixture: ComponentFixture<ItemCategoriesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemCategoriesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemCategoriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
