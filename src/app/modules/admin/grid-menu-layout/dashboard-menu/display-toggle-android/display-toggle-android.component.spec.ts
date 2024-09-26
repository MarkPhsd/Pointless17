import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayToggleAndroidComponent } from './display-toggle-android.component';

describe('DisplayToggleAndroidComponent', () => {
  let component: DisplayToggleAndroidComponent;
  let fixture: ComponentFixture<DisplayToggleAndroidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayToggleAndroidComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayToggleAndroidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
