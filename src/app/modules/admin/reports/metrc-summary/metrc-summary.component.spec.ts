import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetrcSummaryComponent } from './metrc-summary.component';

describe('MetrcSummaryComponent', () => {
  let component: MetrcSummaryComponent;
  let fixture: ComponentFixture<MetrcSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetrcSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetrcSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
