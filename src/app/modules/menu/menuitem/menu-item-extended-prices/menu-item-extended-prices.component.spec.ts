import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuItemExtendedPricesComponent } from './menu-item-extended-prices.component';

describe('MenuItemExtendedPricesComponent', () => {
  let component: MenuItemExtendedPricesComponent;
  let fixture: ComponentFixture<MenuItemExtendedPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuItemExtendedPricesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuItemExtendedPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
