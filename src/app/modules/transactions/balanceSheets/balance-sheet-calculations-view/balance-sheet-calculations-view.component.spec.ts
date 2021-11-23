import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceSheetCalculationsViewComponent } from './balance-sheet-calculations-view.component';

describe('BalanceSheetCalculationsViewComponent', () => {
  let component: BalanceSheetCalculationsViewComponent;
  let fixture: ComponentFixture<BalanceSheetCalculationsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalanceSheetCalculationsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceSheetCalculationsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
