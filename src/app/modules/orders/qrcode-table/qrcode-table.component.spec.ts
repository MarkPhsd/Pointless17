import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QRCodeTableComponent } from './qrcode-table.component';

describe('QRCodeTableComponent', () => {
  let component: QRCodeTableComponent;
  let fixture: ComponentFixture<QRCodeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QRCodeTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QRCodeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
