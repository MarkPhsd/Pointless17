import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorPlanDesignerComponent } from './floor-plan-designer.component';

describe('FloorPlanDesignerComponent', () => {
  let component: FloorPlanDesignerComponent;
  let fixture: ComponentFixture<FloorPlanDesignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloorPlanDesignerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorPlanDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
