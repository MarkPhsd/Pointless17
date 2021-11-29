import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceOptionsComponent } from './price-options.component';

describe('PriceOptionsComponent', () => {
  let component: PriceOptionsComponent;
  let fixture: ComponentFixture<PriceOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
