import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeCheckOutComponent } from './stripe-check-out.component';

describe('StripeCheckOutComponent', () => {
  let component: StripeCheckOutComponent;
  let fixture: ComponentFixture<StripeCheckOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StripeCheckOutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StripeCheckOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
