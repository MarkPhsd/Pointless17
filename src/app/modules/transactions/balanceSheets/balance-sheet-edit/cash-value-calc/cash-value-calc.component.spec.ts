import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashValueCalcComponent } from './cash-value-calc.component';

describe('CashValueCalcComponent', () => {
  let component: CashValueCalcComponent;
  let fixture: ComponentFixture<CashValueCalcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashValueCalcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashValueCalcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
