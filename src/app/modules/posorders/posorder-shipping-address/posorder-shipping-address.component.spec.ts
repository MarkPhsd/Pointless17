import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POSOrderShippingAddressComponent } from './posorder-shipping-address.component';

describe('POSOrderShippingAddressComponent', () => {
  let component: POSOrderShippingAddressComponent;
  let fixture: ComponentFixture<POSOrderShippingAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ POSOrderShippingAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(POSOrderShippingAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
