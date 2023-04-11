import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedPriceSelectorComponent } from './linked-price-selector.component';

describe('LinkedPriceSelectorComponent', () => {
  let component: LinkedPriceSelectorComponent;
  let fixture: ComponentFixture<LinkedPriceSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkedPriceSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkedPriceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
