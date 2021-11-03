import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlatTaxRateListComponent } from './flat-tax-rate-list.component';

describe('FlatTaxRateListComponent', () => {
  let component: FlatTaxRateListComponent;
  let fixture: ComponentFixture<FlatTaxRateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlatTaxRateListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlatTaxRateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
