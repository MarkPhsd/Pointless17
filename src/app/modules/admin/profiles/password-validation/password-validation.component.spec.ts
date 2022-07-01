import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordValidationComponent } from './password-validation.component';

describe('PasswordValidationComponent', () => {
  let component: PasswordValidationComponent;
  let fixture: ComponentFixture<PasswordValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PasswordValidationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
