import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUserGuestComponent } from './new-user-guest.component';

describe('NewUserGuestComponent', () => {
  let component: NewUserGuestComponent;
  let fixture: ComponentFixture<NewUserGuestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewUserGuestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewUserGuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
