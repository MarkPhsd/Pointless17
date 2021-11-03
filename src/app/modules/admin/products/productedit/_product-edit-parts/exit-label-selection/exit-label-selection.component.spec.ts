import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitLabelSelectionComponent } from './exit-label-selection.component';

describe('ExitLabelSelectionComponent', () => {
  let component: ExitLabelSelectionComponent;
  let fixture: ComponentFixture<ExitLabelSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExitLabelSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExitLabelSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
