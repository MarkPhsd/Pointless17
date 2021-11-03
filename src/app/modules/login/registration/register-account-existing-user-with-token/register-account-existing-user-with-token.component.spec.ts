import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterAccountExistingUserWithTokenComponent } from './register-account-existing-user-with-token.component';

describe('RegisterAccountExistingUserWithTokenComponent', () => {
  let component: RegisterAccountExistingUserWithTokenComponent;
  let fixture: ComponentFixture<RegisterAccountExistingUserWithTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterAccountExistingUserWithTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterAccountExistingUserWithTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
