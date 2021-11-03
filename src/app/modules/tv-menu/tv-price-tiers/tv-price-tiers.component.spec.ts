import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvPriceTiersComponent } from './tv-price-tiers.component';

describe('TvPriceTiersComponent', () => {
  let component: TvPriceTiersComponent;
  let fixture: ComponentFixture<TvPriceTiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TvPriceTiersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TvPriceTiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
