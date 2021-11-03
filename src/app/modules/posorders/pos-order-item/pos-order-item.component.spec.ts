import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOrderItemComponent } from './pos-order-item.component';

describe('PosOrderItemComponent', () => {
  let component: PosOrderItemComponent;
  let fixture: ComponentFixture<PosOrderItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosOrderItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosOrderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
