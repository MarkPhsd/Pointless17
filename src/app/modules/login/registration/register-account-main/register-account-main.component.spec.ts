import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterAccountMainComponent } from './register-account-main.component';

describe('RegisterAccountMainComponent', () => {
  let component: RegisterAccountMainComponent;
  let fixture: ComponentFixture<RegisterAccountMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterAccountMainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterAccountMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
