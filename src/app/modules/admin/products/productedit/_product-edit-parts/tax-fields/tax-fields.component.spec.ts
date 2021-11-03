import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxFieldsComponent } from './tax-fields.component';

describe('TaxFieldsComponent', () => {
  let component: TaxFieldsComponent;
  let fixture: ComponentFixture<TaxFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxFieldsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
