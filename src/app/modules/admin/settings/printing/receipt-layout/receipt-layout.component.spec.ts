import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptLayoutComponent } from './receipt-layout.component';

describe('ReceiptLayoutComponent', () => {
  let component: ReceiptLayoutComponent;
  let fixture: ComponentFixture<ReceiptLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceiptLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
