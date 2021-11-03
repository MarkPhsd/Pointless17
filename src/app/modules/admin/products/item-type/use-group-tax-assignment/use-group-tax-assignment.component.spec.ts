import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UseGroupTaxAssignmentComponent } from './use-group-tax-assignment.component';

describe('UseGroupTaxAssignmentComponent', () => {
  let component: UseGroupTaxAssignmentComponent;
  let fixture: ComponentFixture<UseGroupTaxAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UseGroupTaxAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UseGroupTaxAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
