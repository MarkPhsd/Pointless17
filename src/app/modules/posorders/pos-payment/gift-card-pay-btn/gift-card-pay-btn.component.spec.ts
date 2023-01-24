import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftCardPayBtnComponent } from './gift-card-pay-btn.component';

describe('GiftCardPayBtnComponent', () => {
  let component: GiftCardPayBtnComponent;
  let fixture: ComponentFixture<GiftCardPayBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GiftCardPayBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GiftCardPayBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
