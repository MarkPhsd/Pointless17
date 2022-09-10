import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomFloorPlanComponent } from './zoom-floor-plan.component';

describe('ZoomFloorPlanComponent', () => {
  let component: ZoomFloorPlanComponent;
  let fixture: ComponentFixture<ZoomFloorPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZoomFloorPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoomFloorPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
