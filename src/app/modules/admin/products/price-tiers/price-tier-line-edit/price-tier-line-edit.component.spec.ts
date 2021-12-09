import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceTierLineEditComponent } from './price-tier-line-edit.component';

describe('PriceTierLineEditComponent', () => {
  let component: PriceTierLineEditComponent;
  let fixture: ComponentFixture<PriceTierLineEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceTierLineEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceTierLineEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
