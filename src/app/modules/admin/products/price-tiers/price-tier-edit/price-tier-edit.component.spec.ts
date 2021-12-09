import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceTierEditComponent } from './price-tier-edit.component';

describe('PriceTierEditComponent', () => {
  let component: PriceTierEditComponent;
  let fixture: ComponentFixture<PriceTierEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceTierEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceTierEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
