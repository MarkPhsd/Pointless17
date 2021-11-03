import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuItemCardComponent } from './menu-item-card.component';

describe('MenuItemCardComponent', () => {
  let component: MenuItemCardComponent;
  let fixture: ComponentFixture<MenuItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuItemCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuItemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
