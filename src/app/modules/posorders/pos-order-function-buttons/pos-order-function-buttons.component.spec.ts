import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOrderFunctionButtonsComponent } from './pos-order-function-buttons.component';

describe('PosOrderFunctionButtonsComponent', () => {
  let component: PosOrderFunctionButtonsComponent;
  let fixture: ComponentFixture<PosOrderFunctionButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosOrderFunctionButtonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosOrderFunctionButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
