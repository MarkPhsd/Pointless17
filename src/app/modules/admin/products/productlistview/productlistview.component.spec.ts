import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductlistviewComponent } from './productlistview.component';

describe('ProductlistviewComponent', () => {
  let component: ProductlistviewComponent;
  let fixture: ComponentFixture<ProductlistviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductlistviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductlistviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
