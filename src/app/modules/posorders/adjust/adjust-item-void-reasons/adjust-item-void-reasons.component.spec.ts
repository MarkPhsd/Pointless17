import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustItemVoidReasonsComponent } from './adjust-item-void-reasons.component';

describe('AdjustItemVoidReasonsComponent', () => {
  let component: AdjustItemVoidReasonsComponent;
  let fixture: ComponentFixture<AdjustItemVoidReasonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustItemVoidReasonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustItemVoidReasonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
