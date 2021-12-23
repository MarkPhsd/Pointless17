import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceTiersComponent } from './price-tiers.component';

describe('PriceTiersComponent', () => {
  let component: PriceTiersComponent;
  let fixture: ComponentFixture<PriceTiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceTiersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceTiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
