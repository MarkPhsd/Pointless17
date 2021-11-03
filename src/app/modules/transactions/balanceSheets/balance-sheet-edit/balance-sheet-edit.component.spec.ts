import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceSheetEditComponent } from './balance-sheet-edit.component';

describe('BalanceSheetEditComponent', () => {
  let component: BalanceSheetEditComponent;
  let fixture: ComponentFixture<BalanceSheetEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalanceSheetEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceSheetEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
