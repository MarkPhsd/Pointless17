import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelSelectPrinterComponent } from './label-select-printer.component';

describe('LabelSelectPrinterComponent', () => {
  let component: LabelSelectPrinterComponent;
  let fixture: ComponentFixture<LabelSelectPrinterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabelSelectPrinterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabelSelectPrinterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
