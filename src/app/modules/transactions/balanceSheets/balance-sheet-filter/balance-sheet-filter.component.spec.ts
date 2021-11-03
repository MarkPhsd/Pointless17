import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceSheetFilterComponent } from './balance-sheet-filter.component';

describe('BalanceSheetFilterComponent', () => {
  let component: BalanceSheetFilterComponent;
  let fixture: ComponentFixture<BalanceSheetFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalanceSheetFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceSheetFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
