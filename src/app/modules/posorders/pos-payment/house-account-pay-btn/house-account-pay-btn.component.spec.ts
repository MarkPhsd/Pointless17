import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseAccountPayBtnComponent } from './house-account-pay-btn.component';

describe('HouseAccountPayBtnComponent', () => {
  let component: HouseAccountPayBtnComponent;
  let fixture: ComponentFixture<HouseAccountPayBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HouseAccountPayBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseAccountPayBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
