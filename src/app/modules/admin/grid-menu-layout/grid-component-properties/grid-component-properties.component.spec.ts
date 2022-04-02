import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridComponentPropertiesComponent } from './grid-component-properties.component';

describe('GridComponentPropertiesComponent', () => {
  let component: GridComponentPropertiesComponent;
  let fixture: ComponentFixture<GridComponentPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridComponentPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridComponentPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
