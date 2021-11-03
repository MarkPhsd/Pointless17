import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceScheduleConstraintsComponent } from './price-schedule-constraints.component';

describe('PriceScheduleConstraintsComponent', () => {
  let component: PriceScheduleConstraintsComponent;
  let fixture: ComponentFixture<PriceScheduleConstraintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceScheduleConstraintsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceScheduleConstraintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
