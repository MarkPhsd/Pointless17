import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderHeaderDemoGraphicsComponent } from './order-header-demo-graphics.component';

describe('OrderHeaderDemoGraphicsComponent', () => {
  let component: OrderHeaderDemoGraphicsComponent;
  let fixture: ComponentFixture<OrderHeaderDemoGraphicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderHeaderDemoGraphicsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderHeaderDemoGraphicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
