import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceScheduleMenuOptionsComponent } from './price-schedule-menu-options.component';

describe('PriceScheduleMenuOptionsComponent', () => {
  let component: PriceScheduleMenuOptionsComponent;
  let fixture: ComponentFixture<PriceScheduleMenuOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceScheduleMenuOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceScheduleMenuOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
