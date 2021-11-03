import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountOptionsComponent } from './discount-options.component';

describe('DiscountOptionsComponent', () => {
  let component: DiscountOptionsComponent;
  let fixture: ComponentFixture<DiscountOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscountOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
