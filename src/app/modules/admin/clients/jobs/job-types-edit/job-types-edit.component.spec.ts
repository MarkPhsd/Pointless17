import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTypesEditComponent } from './job-types-edit.component';

describe('JobTypesEditComponent', () => {
  let component: JobTypesEditComponent;
  let fixture: ComponentFixture<JobTypesEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobTypesEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTypesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
