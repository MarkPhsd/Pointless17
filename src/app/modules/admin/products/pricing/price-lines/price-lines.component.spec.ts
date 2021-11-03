import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceLinesComponent } from './price-lines.component';

describe('PriceLinesComponent', () => {
  let component: PriceLinesComponent;
  let fixture: ComponentFixture<PriceLinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceLinesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceLinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
