import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrainProductEditComponent } from './strain-product-edit.component';

describe('StrainProductEditComponent', () => {
  let component: StrainProductEditComponent;
  let fixture: ComponentFixture<StrainProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrainProductEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrainProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
