import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTaxReportComponent } from './sales-tax-report.component';

describe('SalesTaxReportComponent', () => {
  let component: SalesTaxReportComponent;
  let fixture: ComponentFixture<SalesTaxReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesTaxReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesTaxReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
