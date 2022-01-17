import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POSOrderScheduleCardComponent } from './posorder-schedule-card.component';

describe('POSOrderScheduleCardComponent', () => {
  let component: POSOrderScheduleCardComponent;
  let fixture: ComponentFixture<POSOrderScheduleCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ POSOrderScheduleCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(POSOrderScheduleCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
