import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileShippingAddressComponent } from './profile-shipping-address.component';

describe('ProfileShippingAddressComponent', () => {
  let component: ProfileShippingAddressComponent;
  let fixture: ComponentFixture<ProfileShippingAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileShippingAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileShippingAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
