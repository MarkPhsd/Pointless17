import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriPOSCardPayBtnComponent } from './tri-poscard-pay-btn.component';

describe('TriPOSCardPayBtnComponent', () => {
  let component: TriPOSCardPayBtnComponent;
  let fixture: ComponentFixture<TriPOSCardPayBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TriPOSCardPayBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TriPOSCardPayBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
