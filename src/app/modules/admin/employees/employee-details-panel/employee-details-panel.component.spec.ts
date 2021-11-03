import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDetailsPanelComponent } from './employee-details-panel.component';

describe('EmployeeDetailsPanelComponent', () => {
  let component: EmployeeDetailsPanelComponent;
  let fixture: ComponentFixture<EmployeeDetailsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDetailsPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDetailsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
