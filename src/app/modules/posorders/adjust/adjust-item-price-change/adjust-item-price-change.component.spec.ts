import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustItemPriceChangeComponent } from './adjust-item-price-change.component';

describe('AdjustItemPriceChangeComponent', () => {
  let component: AdjustItemPriceChangeComponent;
  let fixture: ComponentFixture<AdjustItemPriceChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustItemPriceChangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustItemPriceChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
