import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderFilterPanelComponent } from './order-filter-panel.component';

describe('OrderFilterPanelComponent', () => {
  let component: OrderFilterPanelComponent;
  let fixture: ComponentFixture<OrderFilterPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderFilterPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderFilterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
