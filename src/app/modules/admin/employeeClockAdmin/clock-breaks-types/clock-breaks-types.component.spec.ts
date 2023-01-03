import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockBreaksTypesComponent } from './clock-breaks-types.component';

describe('ClockBreaksTypesComponent', () => {
  let component: ClockBreaksTypesComponent;
  let fixture: ComponentFixture<ClockBreaksTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClockBreaksTypesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClockBreaksTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
