import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitValuesProgressBarsComponent } from './limit-values-progress-bars.component';

describe('LimitValuesProgressBarsComponent', () => {
  let component: LimitValuesProgressBarsComponent;
  let fixture: ComponentFixture<LimitValuesProgressBarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LimitValuesProgressBarsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LimitValuesProgressBarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
