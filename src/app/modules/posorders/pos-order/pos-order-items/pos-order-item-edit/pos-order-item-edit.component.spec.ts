import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOrderItemEditComponent } from './pos-order-item-edit.component';

describe('PosOrderItemEditComponent', () => {
  let component: PosOrderItemEditComponent;
  let fixture: ComponentFixture<PosOrderItemEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosOrderItemEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosOrderItemEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
