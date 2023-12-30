import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EbayReturnPolicyComponent } from './ebay-return-policy.component';

describe('EbayReturnPolicyComponent', () => {
  let component: EbayReturnPolicyComponent;
  let fixture: ComponentFixture<EbayReturnPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EbayReturnPolicyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EbayReturnPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
