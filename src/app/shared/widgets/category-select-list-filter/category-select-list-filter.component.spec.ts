import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorySelectListFilterComponent } from './category-select-list-filter.component';

describe('CategorySelectListFilterComponent', () => {
  let component: CategorySelectListFilterComponent;
  let fixture: ComponentFixture<CategorySelectListFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategorySelectListFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorySelectListFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
