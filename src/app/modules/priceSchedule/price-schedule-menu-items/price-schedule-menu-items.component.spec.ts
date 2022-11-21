import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceScheduleMenuItemsComponent } from './price-schedule-menu-items.component';

describe('PriceScheduleMenuItemsComponent', () => {
  let component: PriceScheduleMenuItemsComponent;
  let fixture: ComponentFixture<PriceScheduleMenuItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceScheduleMenuItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceScheduleMenuItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
