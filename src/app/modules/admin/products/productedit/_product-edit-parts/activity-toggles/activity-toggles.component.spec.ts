import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityTogglesComponent } from './activity-toggles.component';

describe('ActivityTogglesComponent', () => {
  let component: ActivityTogglesComponent;
  let fixture: ComponentFixture<ActivityTogglesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivityTogglesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityTogglesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
