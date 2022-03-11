import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepOrderComponent } from './prep-order.component';

describe('PrepOrderComponent', () => {
  let component: PrepOrderComponent;
  let fixture: ComponentFixture<PrepOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrepOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrepOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
