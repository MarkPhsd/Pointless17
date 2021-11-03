import { ComponentFixture, TestBed } from '@angular/core/testing';

import { METRCProductsAddComponent } from './products-add.component';

describe('ProductsAddComponent', () => {
  let component: METRCProductsAddComponent;
  let fixture: ComponentFixture<METRCProductsAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ METRCProductsAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(METRCProductsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
