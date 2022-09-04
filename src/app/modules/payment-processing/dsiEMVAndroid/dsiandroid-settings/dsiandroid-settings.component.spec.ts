import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DSIAndroidSettingsComponent } from './dsiandroid-settings.component';

describe('DSIAndroidSettingsComponent', () => {
  let component: DSIAndroidSettingsComponent;
  let fixture: ComponentFixture<DSIAndroidSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DSIAndroidSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DSIAndroidSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
