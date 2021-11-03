import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLookupComponent } from './employee-lookup.component';

describe('EmployeeLookupComponent', () => {
  let component: EmployeeLookupComponent;
  let fixture: ComponentFixture<EmployeeLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeLookupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
