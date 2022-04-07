import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTotalBoardComponent } from './order-total-board.component';

describe('OrderTotalBoardComponent', () => {
  let component: OrderTotalBoardComponent;
  let fixture: ComponentFixture<OrderTotalBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderTotalBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderTotalBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
