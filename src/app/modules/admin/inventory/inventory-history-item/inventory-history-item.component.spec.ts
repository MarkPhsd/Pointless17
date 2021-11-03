import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryHistoryItemComponent } from './inventory-history-item.component';

describe('InventoryHistoryItemComponent', () => {
  let component: InventoryHistoryItemComponent;
  let fixture: ComponentFixture<InventoryHistoryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryHistoryItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryHistoryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
