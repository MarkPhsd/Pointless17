import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceSheetHeaderViewComponent } from './balance-sheet-header-view.component';

describe('BalanceSheetHeaderViewComponent', () => {
  let component: BalanceSheetHeaderViewComponent;
  let fixture: ComponentFixture<BalanceSheetHeaderViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalanceSheetHeaderViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceSheetHeaderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
