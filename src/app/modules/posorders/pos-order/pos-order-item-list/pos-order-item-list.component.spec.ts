import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOrderItemListComponent } from './pos-order-item-list.component';

describe('PosOrderItemListComponent', () => {
  let component: PosOrderItemListComponent;
  let fixture: ComponentFixture<PosOrderItemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosOrderItemListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosOrderItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
