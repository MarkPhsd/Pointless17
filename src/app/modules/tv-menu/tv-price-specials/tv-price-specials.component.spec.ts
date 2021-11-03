import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvPriceSpecialsComponent } from './tv-price-specials.component';

describe('TvPriceSpecialsComponent', () => {
  let component: TvPriceSpecialsComponent;
  let fixture: ComponentFixture<TvPriceSpecialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TvPriceSpecialsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TvPriceSpecialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
