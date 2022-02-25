import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POSOrderScheduleFormComponent } from './posorder-schedule-form.component';

describe('POSOrderScheduleFormComponent', () => {
  let component: POSOrderScheduleFormComponent;
  let fixture: ComponentFixture<POSOrderScheduleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ POSOrderScheduleFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(POSOrderScheduleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
