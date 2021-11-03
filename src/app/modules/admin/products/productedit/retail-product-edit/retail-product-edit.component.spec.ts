import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailProductEditComponent } from './retail-product-edit.component';

describe('RetailProductEditComponent', () => {
  let component: RetailProductEditComponent;
  let fixture: ComponentFixture<RetailProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetailProductEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
