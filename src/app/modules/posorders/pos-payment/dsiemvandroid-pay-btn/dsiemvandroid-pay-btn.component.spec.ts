import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DSIEMVAndroidPayBtnComponent } from './dsiemvandroid-pay-btn.component';

describe('DSIEMVAndroidPayBtnComponent', () => {
  let component: DSIEMVAndroidPayBtnComponent;
  let fixture: ComponentFixture<DSIEMVAndroidPayBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DSIEMVAndroidPayBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DSIEMVAndroidPayBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
