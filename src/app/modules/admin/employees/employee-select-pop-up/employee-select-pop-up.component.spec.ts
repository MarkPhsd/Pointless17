import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSelectPopUpComponent } from './employee-select-pop-up.component';

describe('EmployeeSelectPopUpComponent', () => {
  let component: EmployeeSelectPopUpComponent;
  let fixture: ComponentFixture<EmployeeSelectPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeSelectPopUpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSelectPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
