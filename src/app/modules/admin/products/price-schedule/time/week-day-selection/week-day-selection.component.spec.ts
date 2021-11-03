import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekDaySelectionComponent } from './week-day-selection.component';

describe('WeekDaySelectionComponent', () => {
  let component: WeekDaySelectionComponent;
  let fixture: ComponentFixture<WeekDaySelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeekDaySelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekDaySelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
