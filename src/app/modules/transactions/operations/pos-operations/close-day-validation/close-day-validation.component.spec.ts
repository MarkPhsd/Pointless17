import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseDayValidationComponent } from './close-day-validation.component';

describe('CloseDayValidationComponent', () => {
  let component: CloseDayValidationComponent;
  let fixture: ComponentFixture<CloseDayValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseDayValidationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseDayValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
