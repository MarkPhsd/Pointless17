import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuItemProductCountComponent } from './menu-item-product-count.component';

describe('MenuItemProductCountComponent', () => {
  let component: MenuItemProductCountComponent;
  let fixture: ComponentFixture<MenuItemProductCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuItemProductCountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuItemProductCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
