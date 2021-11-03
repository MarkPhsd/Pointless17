import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPriceSelectionComponent } from './menu-price-selection.component';

describe('MenuPriceSelectionComponent', () => {
  let component: MenuPriceSelectionComponent;
  let fixture: ComponentFixture<MenuPriceSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuPriceSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuPriceSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
