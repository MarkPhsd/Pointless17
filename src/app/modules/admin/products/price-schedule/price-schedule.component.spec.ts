import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceScheduleComponent } from './price-schedule.component';

describe('PriceScheduleComponent', () => {
  let component: PriceScheduleComponent;
  let fixture: ComponentFixture<PriceScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
