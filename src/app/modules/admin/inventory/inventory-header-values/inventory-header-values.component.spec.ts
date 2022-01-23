import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryHeaderValuesComponent } from './inventory-header-values.component';

describe('InventoryHeaderValuesComponent', () => {
  let component: InventoryHeaderValuesComponent;
  let fixture: ComponentFixture<InventoryHeaderValuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryHeaderValuesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryHeaderValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
