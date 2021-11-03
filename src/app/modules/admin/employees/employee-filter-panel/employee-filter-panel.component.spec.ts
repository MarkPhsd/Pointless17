import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeFilterPanelComponent } from './employee-filter-panel.component';

describe('EmployeeFilterPanelComponent', () => {
  let component: EmployeeFilterPanelComponent;
  let fixture: ComponentFixture<EmployeeFilterPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeFilterPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeFilterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
