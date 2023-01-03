import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTypesListComponent } from './job-types-list.component';

describe('JobTypesListComponent', () => {
  let component: JobTypesListComponent;
  let fixture: ComponentFixture<JobTypesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobTypesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTypesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
