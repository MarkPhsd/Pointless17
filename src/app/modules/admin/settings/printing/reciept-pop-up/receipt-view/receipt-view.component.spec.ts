import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptViewComponent } from './receipt-view.component';

describe('ReceiptViewComponent', () => {
  let component: ReceiptViewComponent;
  let fixture: ComponentFixture<ReceiptViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceiptViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
