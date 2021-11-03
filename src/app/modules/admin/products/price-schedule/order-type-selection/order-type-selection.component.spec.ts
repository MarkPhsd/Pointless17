import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTypeSelectionComponent } from './order-type-selection.component';

describe('OrderTypeSelectionComponent', () => {
  let component: OrderTypeSelectionComponent;
  let fixture: ComponentFixture<OrderTypeSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderTypeSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderTypeSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
