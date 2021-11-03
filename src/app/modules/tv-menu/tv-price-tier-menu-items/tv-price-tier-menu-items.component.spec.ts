import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvPriceTierMenuItemsComponent } from './tv-price-tier-menu-items.component';

describe('TvPriceTierMenuItemsComponent', () => {
  let component: TvPriceTierMenuItemsComponent;
  let fixture: ComponentFixture<TvPriceTierMenuItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TvPriceTierMenuItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TvPriceTierMenuItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
