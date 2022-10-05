import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QROrderComponent } from './qrorder.component';

describe('QROrderComponent', () => {
  let component: QROrderComponent;
  let fixture: ComponentFixture<QROrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QROrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QROrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
