import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsiEMVCardPayBtnComponent } from './dsi-emvcard-pay-btn.component';

describe('DsiEMVCardPayBtnComponent', () => {
  let component: DsiEMVCardPayBtnComponent;
  let fixture: ComponentFixture<DsiEMVCardPayBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DsiEMVCardPayBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DsiEMVCardPayBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
