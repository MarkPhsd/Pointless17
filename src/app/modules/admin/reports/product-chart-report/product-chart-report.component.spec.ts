import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductChartReportComponent } from './product-chart-report.component';

describe('ProductChartReportComponent', () => {
  let component: ProductChartReportComponent;
  let fixture: ComponentFixture<ProductChartReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductChartReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductChartReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
