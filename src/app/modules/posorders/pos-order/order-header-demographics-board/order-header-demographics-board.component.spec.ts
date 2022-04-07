import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderHeaderDemographicsBoardComponent } from './order-header-demographics-board.component';

describe('OrderHeaderDemographicsBoardComponent', () => {
  let component: OrderHeaderDemographicsBoardComponent;
  let fixture: ComponentFixture<OrderHeaderDemographicsBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderHeaderDemographicsBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderHeaderDemographicsBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
