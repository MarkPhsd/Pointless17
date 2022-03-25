import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeSettingsComponent } from './stripe-settings.component';

describe('StripeSettingsComponent', () => {
  let component: StripeSettingsComponent;
  let fixture: ComponentFixture<StripeSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StripeSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StripeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
