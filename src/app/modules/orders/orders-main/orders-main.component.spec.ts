import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersMainComponent } from './orders-main.component';

describe('OrdersMainComponent', () => {
  let component: OrdersMainComponent;
  let fixture: ComponentFixture<OrdersMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdersMainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
