import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceScheduleInfoComponent } from './price-schedule-info.component';

describe('PriceScheduleInfoComponent', () => {
  let component: PriceScheduleInfoComponent;
  let fixture: ComponentFixture<PriceScheduleInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceScheduleInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceScheduleInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
