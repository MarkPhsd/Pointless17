import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierPriceLineComponent } from './tier-price-line.component';

describe('TierPriceLineComponent', () => {
  let component: TierPriceLineComponent;
  let fixture: ComponentFixture<TierPriceLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TierPriceLineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TierPriceLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
