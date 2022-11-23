import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceScheduleSortComponent } from './price-schedule-sort.component';

describe('PriceScheduleSortComponent', () => {
  let component: PriceScheduleSortComponent;
  let fixture: ComponentFixture<PriceScheduleSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceScheduleSortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceScheduleSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
