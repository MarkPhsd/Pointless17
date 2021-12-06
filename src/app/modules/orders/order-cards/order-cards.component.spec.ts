import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCardsComponent } from './order-cards.component';

describe('OrderCardsComponent', () => {
  let component: OrderCardsComponent;
  let fixture: ComponentFixture<OrderCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderCardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
