import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseItemCostHistoryComponent } from './purchase-item-cost-history.component';

describe('PurchaseItemCostHistoryComponent', () => {
  let component: PurchaseItemCostHistoryComponent;
  let fixture: ComponentFixture<PurchaseItemCostHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseItemCostHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseItemCostHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
