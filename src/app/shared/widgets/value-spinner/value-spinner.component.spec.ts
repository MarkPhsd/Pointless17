import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueSpinnerComponent } from './value-spinner.component';

describe('ValueSpinnerComponent', () => {
  let component: ValueSpinnerComponent;
  let fixture: ComponentFixture<ValueSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValueSpinnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
