import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemicalValuesComponent } from './chemical-values.component';

describe('ChemicalValuesComponent', () => {
  let component: ChemicalValuesComponent;
  let fixture: ComponentFixture<ChemicalValuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChemicalValuesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChemicalValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
