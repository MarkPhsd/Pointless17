import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POSOrderScheduleComponent } from './posorder-schedule.component';

describe('POSOrderScheduleComponent', () => {
  let component: POSOrderScheduleComponent;
  let fixture: ComponentFixture<POSOrderScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ POSOrderScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(POSOrderScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
