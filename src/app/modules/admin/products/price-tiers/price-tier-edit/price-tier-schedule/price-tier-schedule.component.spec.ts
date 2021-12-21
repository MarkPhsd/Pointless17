import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceTierScheduleComponent } from './price-tier-schedule.component';

describe('PriceTierScheduleComponent', () => {
  let component: PriceTierScheduleComponent;
  let fixture: ComponentFixture<PriceTierScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceTierScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceTierScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
