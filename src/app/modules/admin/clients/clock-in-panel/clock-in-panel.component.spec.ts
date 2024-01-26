import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockInPanelComponent } from './clock-in-panel.component';

describe('ClockInPanelComponent', () => {
  let component: ClockInPanelComponent;
  let fixture: ComponentFixture<ClockInPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClockInPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClockInPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
