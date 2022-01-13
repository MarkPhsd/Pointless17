import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UIHomePageSettingsComponent } from './uihome-page-settings.component';

describe('UIHomePageSettingsComponent', () => {
  let component: UIHomePageSettingsComponent;
  let fixture: ComponentFixture<UIHomePageSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UIHomePageSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UIHomePageSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
