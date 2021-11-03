import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTypeSelectComponent } from './product-type-select.component';

describe('ProductTypeSelectComponent', () => {
  let component: ProductTypeSelectComponent;
  let fixture: ComponentFixture<ProductTypeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductTypeSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTypeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
