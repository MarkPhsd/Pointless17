import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSelectorComponent } from './report-selector.component';

describe('ReportSelectorComponent', () => {
  let component: ReportSelectorComponent;
  let fixture: ComponentFixture<ReportSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
