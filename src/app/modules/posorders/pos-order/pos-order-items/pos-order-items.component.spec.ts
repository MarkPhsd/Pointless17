import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOrderItemsComponent } from './pos-order-items.component';

describe('PosOrderItemsComponent', () => {
  let component: PosOrderItemsComponent;
  let fixture: ComponentFixture<PosOrderItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosOrderItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosOrderItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
