import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EbayFulfillmentPolicyComponent } from './ebay-fulfillment-policy.component';

describe('EbayFulfillmentPolicyComponent', () => {
  let component: EbayFulfillmentPolicyComponent;
  let fixture: ComponentFixture<EbayFulfillmentPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EbayFulfillmentPolicyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EbayFulfillmentPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
