import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryListToolTipComponent } from './inventory-list-tool-tip.component';

describe('InventoryListToolTipComponent', () => {
  let component: InventoryListToolTipComponent;
  let fixture: ComponentFixture<InventoryListToolTipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryListToolTipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryListToolTipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
