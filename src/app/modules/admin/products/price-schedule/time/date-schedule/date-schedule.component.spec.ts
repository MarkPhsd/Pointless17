import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateScheduleComponent } from './date-schedule.component';

describe('DateScheduleComponent', () => {
  let component: DateScheduleComponent;
  let fixture: ComponentFixture<DateScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
