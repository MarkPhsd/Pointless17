import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterLocationSelectionComponent } from './printer-location-selection.component';

describe('PrinterLocationSelectionComponent', () => {
  let component: PrinterLocationSelectionComponent;
  let fixture: ComponentFixture<PrinterLocationSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrinterLocationSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrinterLocationSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
