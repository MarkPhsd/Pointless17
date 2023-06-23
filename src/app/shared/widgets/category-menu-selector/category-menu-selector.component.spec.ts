import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryMenuSelectorComponent } from './category-menu-selector.component';

describe('CategoryMenuSelectorComponent', () => {
  let component: CategoryMenuSelectorComponent;
  let fixture: ComponentFixture<CategoryMenuSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryMenuSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryMenuSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
