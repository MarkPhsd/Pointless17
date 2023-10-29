import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachMarksButtonComponent } from './coach-marks-button.component';

describe('CoachMarksButtonComponent', () => {
  let component: CoachMarksButtonComponent;
  let fixture: ComponentFixture<CoachMarksButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoachMarksButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoachMarksButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
