import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleSettingsComponent } from './scale-settings.component';

describe('ScaleSettingsComponent', () => {
  let component: ScaleSettingsComponent;
  let fixture: ComponentFixture<ScaleSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScaleSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
