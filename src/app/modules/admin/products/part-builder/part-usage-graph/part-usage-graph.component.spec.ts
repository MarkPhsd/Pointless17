import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartUsageGraphComponent } from './part-usage-graph.component';

describe('PartUsageGraphComponent', () => {
  let component: PartUsageGraphComponent;
  let fixture: ComponentFixture<PartUsageGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartUsageGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartUsageGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
