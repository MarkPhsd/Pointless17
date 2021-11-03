import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryAdjustmentNoteComponent } from './adjustment-note.component';

describe('AdjustmentNoteComponent', () => {
  let component: InventoryAdjustmentNoteComponent;
  let fixture: ComponentFixture<InventoryAdjustmentNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryAdjustmentNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryAdjustmentNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
