import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeClockFilterComponent } from './employee-clock-filter.component';

describe('EmployeeClockFilterComponent', () => {
  let component: EmployeeClockFilterComponent;
  let fixture: ComponentFixture<EmployeeClockFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeClockFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeClockFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
