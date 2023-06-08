import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportGroupSelectorComponent } from './report-group-selector.component';

describe('ReportGroupSelectorComponent', () => {
  let component: ReportGroupSelectorComponent;
  let fixture: ComponentFixture<ReportGroupSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportGroupSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportGroupSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
