import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceScheduleMenuListComponent } from './price-schedule-menu-list.component';

describe('PriceScheduleMenuListComponent', () => {
  let component: PriceScheduleMenuListComponent;
  let fixture: ComponentFixture<PriceScheduleMenuListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceScheduleMenuListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceScheduleMenuListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
