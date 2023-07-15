import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOrderItemComponent } from './new-order-item.component';

describe('NewOrderItemComponent', () => {
  let component: NewOrderItemComponent;
  let fixture: ComponentFixture<NewOrderItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewOrderItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewOrderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
