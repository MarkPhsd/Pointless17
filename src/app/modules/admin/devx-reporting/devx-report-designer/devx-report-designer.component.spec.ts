import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevxReportDesignerComponent } from './devx-report-designer.component';

describe('DevxReportDesignerComponent', () => {
  let component: DevxReportDesignerComponent;
  let fixture: ComponentFixture<DevxReportDesignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DevxReportDesignerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DevxReportDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
