import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WicEBTCardPayBtnComponent } from './wic-ebtcard-pay-btn.component';

describe('WicEBTCardPayBtnComponent', () => {
  let component: WicEBTCardPayBtnComponent;
  let fixture: ComponentFixture<WicEBTCardPayBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WicEBTCardPayBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WicEBTCardPayBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
