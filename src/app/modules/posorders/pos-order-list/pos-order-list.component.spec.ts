import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOrderListComponent } from './pos-order-list.component';

describe('PosOrderListComponent', () => {
  let component: PosOrderListComponent;
  let fixture: ComponentFixture<PosOrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosOrderListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
