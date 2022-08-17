import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppWizardProgressButtonComponent } from './app-wizard-progress-button.component';

describe('AppWizardProgressButtonComponent', () => {
  let component: AppWizardProgressButtonComponent;
  let fixture: ComponentFixture<AppWizardProgressButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppWizardProgressButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppWizardProgressButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
