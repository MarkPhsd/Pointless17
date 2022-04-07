import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitValuesCardComponent } from './limit-values-card.component';

describe('LimitValuesCardComponent', () => {
  let component: LimitValuesCardComponent;
  let fixture: ComponentFixture<LimitValuesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LimitValuesCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LimitValuesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
