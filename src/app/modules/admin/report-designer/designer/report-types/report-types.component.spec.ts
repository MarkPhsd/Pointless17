import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTypesComponent } from './report-types.component';

describe('ReportTypesComponent', () => {
  let component: ReportTypesComponent;
  let fixture: ComponentFixture<ReportTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportTypesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
