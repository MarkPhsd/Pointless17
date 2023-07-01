import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AverageHourlySalesLaborChartComponent } from './average-hourly-sales-labor-chart.component';

describe('AverageHourlySalesLaborChartComponent', () => {
  let component: AverageHourlySalesLaborChartComponent;
  let fixture: ComponentFixture<AverageHourlySalesLaborChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AverageHourlySalesLaborChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AverageHourlySalesLaborChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
