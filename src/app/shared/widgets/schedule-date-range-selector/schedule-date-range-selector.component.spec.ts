import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleDateRangeSelectorComponent } from './schedule-date-range-selector.component';

describe('ScheduleDateRangeSelectorComponent', () => {
  let component: ScheduleDateRangeSelectorComponent;
  let fixture: ComponentFixture<ScheduleDateRangeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduleDateRangeSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleDateRangeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
