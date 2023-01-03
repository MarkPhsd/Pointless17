import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeClockListComponent } from './employee-clock-list.component';

describe('EmployeeClockListComponent', () => {
  let component: EmployeeClockListComponent;
  let fixture: ComponentFixture<EmployeeClockListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeClockListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeClockListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
