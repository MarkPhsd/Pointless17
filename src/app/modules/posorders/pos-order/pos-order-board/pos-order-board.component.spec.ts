import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOrderBoardComponent } from './pos-order-board.component';

describe('PosOrderBoardComponent', () => {
  let component: PosOrderBoardComponent;
  let fixture: ComponentFixture<PosOrderBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosOrderBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosOrderBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
