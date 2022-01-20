import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryCountsViewComponent } from './inventory-counts-view.component';

describe('InventoryCountsViewComponent', () => {
  let component: InventoryCountsViewComponent;
  let fixture: ComponentFixture<InventoryCountsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryCountsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryCountsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
