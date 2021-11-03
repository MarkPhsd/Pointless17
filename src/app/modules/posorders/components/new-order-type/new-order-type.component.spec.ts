import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOrderTypeComponent } from './new-order-type.component';

describe('NewOrderTypeComponent', () => {
  let component: NewOrderTypeComponent;
  let fixture: ComponentFixture<NewOrderTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewOrderTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewOrderTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
