import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceSheetQuickViewComponent } from './balance-sheet-quick-view.component';

describe('BalanceSheetQuickViewComponent', () => {
  let component: BalanceSheetQuickViewComponent;
  let fixture: ComponentFixture<BalanceSheetQuickViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalanceSheetQuickViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceSheetQuickViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
