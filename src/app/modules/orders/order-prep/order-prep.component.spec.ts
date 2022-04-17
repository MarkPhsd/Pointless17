import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPrepComponent } from './order-prep.component';

describe('OrderPrepComponent', () => {
  let component: OrderPrepComponent;
  let fixture: ComponentFixture<OrderPrepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderPrepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderPrepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
