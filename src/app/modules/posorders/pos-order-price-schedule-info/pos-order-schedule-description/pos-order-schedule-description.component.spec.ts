import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOrderScheduleDescriptionComponent } from './pos-order-schedule-description.component';

describe('PosOrderScheduleDescriptionComponent', () => {
  let component: PosOrderScheduleDescriptionComponent;
  let fixture: ComponentFixture<PosOrderScheduleDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosOrderScheduleDescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosOrderScheduleDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
