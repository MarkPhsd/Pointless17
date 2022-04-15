import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridcomponentPropertiesDesignComponent } from './gridcomponent-properties-design.component';

describe('GridcomponentPropertiesDesignComponent', () => {
  let component: GridcomponentPropertiesDesignComponent;
  let fixture: ComponentFixture<GridcomponentPropertiesDesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridcomponentPropertiesDesignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridcomponentPropertiesDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
