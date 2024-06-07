import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesOnClockListComponent } from './employees-on-clock-list.component';

describe('EmployeesOnClockListComponent', () => {
  let component: EmployeesOnClockListComponent;
  let fixture: ComponentFixture<EmployeesOnClockListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeesOnClockListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesOnClockListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
