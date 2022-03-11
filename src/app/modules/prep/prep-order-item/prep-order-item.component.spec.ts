import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepOrderItemComponent } from './prep-order-item.component';

describe('PrepOrderItemComponent', () => {
  let component: PrepOrderItemComponent;
  let fixture: ComponentFixture<PrepOrderItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrepOrderItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrepOrderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
