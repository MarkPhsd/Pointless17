import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseItemSalesComponent } from './purchase-item-sales.component';

describe('PurchaseItemSalesComponent', () => {
  let component: PurchaseItemSalesComponent;
  let fixture: ComponentFixture<PurchaseItemSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseItemSalesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseItemSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
