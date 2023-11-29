import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryMenuItemComponent } from './inventory-menu-item.component';

describe('InventoryMenuItemComponent', () => {
  let component: InventoryMenuItemComponent;
  let fixture: ComponentFixture<InventoryMenuItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryMenuItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryMenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
