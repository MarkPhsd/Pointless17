import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiersWithPricesComponent } from './tiers-with-prices.component';

describe('TiersWithPricesComponent', () => {
  let component: TiersWithPricesComponent;
  let fixture: ComponentFixture<TiersWithPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TiersWithPricesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiersWithPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
