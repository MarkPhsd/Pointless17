import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosSplitOrdersComponent } from './pos-split-orders.component';

describe('PosSplitOrdersComponent', () => {
  let component: PosSplitOrdersComponent;
  let fixture: ComponentFixture<PosSplitOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosSplitOrdersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosSplitOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
