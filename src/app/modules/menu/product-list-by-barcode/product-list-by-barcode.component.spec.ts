import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListByBarcodeComponent } from './product-list-by-barcode.component';

describe('ProductListByBarcodeComponent', () => {
  let component: ProductListByBarcodeComponent;
  let fixture: ComponentFixture<ProductListByBarcodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductListByBarcodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListByBarcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
