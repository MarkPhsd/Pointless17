import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeClockEditComponent } from './employee-clock-edit.component';

describe('EmployeeClockEditComponent', () => {
  let component: EmployeeClockEditComponent;
  let fixture: ComponentFixture<EmployeeClockEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeClockEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeClockEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
