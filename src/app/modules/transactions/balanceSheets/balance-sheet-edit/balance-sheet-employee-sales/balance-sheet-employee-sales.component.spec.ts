import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceSheetEmployeeSalesComponent } from './balance-sheet-employee-sales.component';

describe('BalanceSheetEmployeeSalesComponent', () => {
  let component: BalanceSheetEmployeeSalesComponent;
  let fixture: ComponentFixture<BalanceSheetEmployeeSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalanceSheetEmployeeSalesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceSheetEmployeeSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
