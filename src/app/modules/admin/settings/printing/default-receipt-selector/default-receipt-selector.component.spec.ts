import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultReceiptSelectorComponent } from './default-receipt-selector.component';

describe('DefaultReceiptSelectorComponent', () => {
  let component: DefaultReceiptSelectorComponent;
  let fixture: ComponentFixture<DefaultReceiptSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefaultReceiptSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultReceiptSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
