import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMetrcKeyEntryComponent } from './employee-metrc-key-entry.component';

describe('EmployeeMetrcKeyEntryComponent', () => {
  let component: EmployeeMetrcKeyEntryComponent;
  let fixture: ComponentFixture<EmployeeMetrcKeyEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeMetrcKeyEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeMetrcKeyEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
