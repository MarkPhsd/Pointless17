import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterLocationsComponent } from './printer-locations.component';

describe('PrinterLocationsComponent', () => {
  let component: PrinterLocationsComponent;
  let fixture: ComponentFixture<PrinterLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrinterLocationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrinterLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
