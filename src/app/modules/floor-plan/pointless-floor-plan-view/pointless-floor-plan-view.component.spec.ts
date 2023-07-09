import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointlessFloorPlanViewComponent } from './pointless-floor-plan-view.component';

describe('PointlessFloorPlanViewComponent', () => {
  let component: PointlessFloorPlanViewComponent;
  let fixture: ComponentFixture<PointlessFloorPlanViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PointlessFloorPlanViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointlessFloorPlanViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
