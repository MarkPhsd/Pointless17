import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileBillingAddressComponent } from './profile-billing-address.component';

describe('ProfileBillingAddressComponent', () => {
  let component: ProfileBillingAddressComponent;
  let fixture: ComponentFixture<ProfileBillingAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileBillingAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileBillingAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
