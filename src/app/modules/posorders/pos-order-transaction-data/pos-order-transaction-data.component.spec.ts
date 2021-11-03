import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOrderTransactionDataComponent } from './pos-order-transaction-data.component';

describe('PosOrderTransactionDataComponent', () => {
  let component: PosOrderTransactionDataComponent;
  let fixture: ComponentFixture<PosOrderTransactionDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosOrderTransactionDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosOrderTransactionDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
