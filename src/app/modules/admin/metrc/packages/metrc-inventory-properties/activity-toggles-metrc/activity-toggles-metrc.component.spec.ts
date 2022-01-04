import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityTogglesMetrcComponent } from './activity-toggles-metrc.component';

describe('ActivityTogglesMetrcComponent', () => {
  let component: ActivityTogglesMetrcComponent;
  let fixture: ComponentFixture<ActivityTogglesMetrcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivityTogglesMetrcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityTogglesMetrcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
