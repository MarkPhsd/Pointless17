import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentReasonsComponent } from './adjustment-reasons.component';

describe('AdjustmentReasonsComponent', () => {
  let component: AdjustmentReasonsComponent;
  let fixture: ComponentFixture<AdjustmentReasonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustmentReasonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustmentReasonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
