import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOrderPriceScheduleInfoComponent } from './pos-order-price-schedule-info.component';

describe('PosOrderPriceScheduleInfoComponent', () => {
  let component: PosOrderPriceScheduleInfoComponent;
  let fixture: ComponentFixture<PosOrderPriceScheduleInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosOrderPriceScheduleInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosOrderPriceScheduleInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
