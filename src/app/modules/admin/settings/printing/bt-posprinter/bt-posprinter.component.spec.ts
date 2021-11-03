import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtPOSPrinterComponent } from './bt-posprinter.component';

describe('BtPOSPrinterComponent', () => {
  let component: BtPOSPrinterComponent;
  let fixture: ComponentFixture<BtPOSPrinterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BtPOSPrinterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BtPOSPrinterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
