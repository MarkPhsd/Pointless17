import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartTableComponent } from './chart-table.component';

describe('ChartTableComponent', () => {
  let component: ChartTableComponent;
  let fixture: ComponentFixture<ChartTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
