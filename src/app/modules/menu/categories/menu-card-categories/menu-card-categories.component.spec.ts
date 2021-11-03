import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuCardCategoriesComponent } from './menu-card-categories.component';

describe('MenuCardCategoriesComponent', () => {
  let component: MenuCardCategoriesComponent;
  let fixture: ComponentFixture<MenuCardCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuCardCategoriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuCardCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
