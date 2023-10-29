import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInProfileComponent } from './CheckInProfileComponent';

describe('CheckInProfileComponent', () => {
  let component: CheckInProfileComponent;
  let fixture: ComponentFixture<CheckInProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckInProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckInProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
