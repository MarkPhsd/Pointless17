import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterAccountExistingUserComponent } from './register-account-existing-user.component';

describe('RegisterAccountExistingUserComponent', () => {
  let component: RegisterAccountExistingUserComponent;
  let fixture: ComponentFixture<RegisterAccountExistingUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterAccountExistingUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterAccountExistingUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
