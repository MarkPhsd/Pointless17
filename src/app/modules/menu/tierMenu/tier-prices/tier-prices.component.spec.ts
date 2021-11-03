import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierPricesComponent } from './tier-prices.component';

describe('TierPricesComponent', () => {
  let component: TierPricesComponent;
  let fixture: ComponentFixture<TierPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TierPricesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TierPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
