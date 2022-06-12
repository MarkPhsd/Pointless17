import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceSheetViewComponent } from './balance-sheet-view.component';

describe('BalanceSheetViewComponent', () => {
  let component: BalanceSheetViewComponent;
  let fixture: ComponentFixture<BalanceSheetViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalanceSheetViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceSheetViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
